// Three.js 3D Park Scene for Cedar Point
// Clean Paved Roads, 100% Path Node Alignment, Dynamic Camera Zoom, Lightning Thrill Energy, and Expanded Park Fences
import * as THREE from 'three';

export class Park3D {
  constructor(container, onCashEarned) {
    this.container = container;
    this.onCashEarned = onCashEarned;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Park Manager Avatar
    this.managerGroup = null;
    this.managerTarget = new THREE.Vector3(0, 0, 24);
    this.isManagerBuilding = false;
    this.activeSocketId = null;

    // Coaster State
    this.coasterStage = 1;
    this.coasterCurve = null;
    this.coasterTrackGroup = new THREE.Group();
    this.trainUnits = [];
    this.trainProgress = 0;
    this.trainSpeed = 0.0028;

    // Collections
    this.sockets = {};
    this.buildings = {};
    this.peeps = [];
    this.particles = [];
    this.turnstileBars = [];
    this.clock = new THREE.Clock();

    // Dynamic Camera Zoom
    this.buildProgressRatio = 0;
    this.targetCameraPos = new THREE.Vector3(0, 48, 52);
    this.targetLookAt = new THREE.Vector3(0, 2, -6);
    this.currentLookAt = new THREE.Vector3(0, 2, -6);

    // Cedar Point Node Graph Network (100% Math Aligned to Visual Road Shape Centerlines)
    this.NODES = {
      OUTSIDE: new THREE.Vector3(0, 0, 44),
      TURNSTILE: new THREE.Vector3(0, 0, 38),
      
      J_SOUTH: new THREE.Vector3(0, 0, 32),
      J_MIDWAY_1: new THREE.Vector3(0, 0, 22),
      J_MIDWAY_2: new THREE.Vector3(0, 0, 12),
      J_MIDWAY_3: new THREE.Vector3(0, 0, 2),
      J_NORTH: new THREE.Vector3(0, 0, -10),
      J_COASTER: new THREE.Vector3(-16, 0, -26),

      RENTALS_DOOR: new THREE.Vector3(-10, 0, 32),
      HUGOS_DOOR: new THREE.Vector3(-12, 0, 22),
      COASTERS_DOOR: new THREE.Vector3(12, 0, 22),
      FRENCH_DOOR: new THREE.Vector3(-12, 0, 12),
      FRIAR_DOOR: new THREE.Vector3(12, 0, 12),
      PAVILION_DOOR: new THREE.Vector3(16, 0, 2),
      BACKBEAT_DOOR: new THREE.Vector3(-12, 0, -10),
      BAYHARBOR_DOOR: new THREE.Vector3(-24, 0, -20),
      BREAKERS_DOOR: new THREE.Vector3(28, 0, -4),
      CASTAWAY_DOOR: new THREE.Vector3(-26, 0, 40)
    };

    this.GRAPH = {
      OUTSIDE: ['TURNSTILE'],
      TURNSTILE: ['OUTSIDE', 'J_SOUTH'],
      J_SOUTH: ['TURNSTILE', 'RENTALS_DOOR', 'J_MIDWAY_1'],
      RENTALS_DOOR: ['J_SOUTH'],

      J_MIDWAY_1: ['J_SOUTH', 'HUGOS_DOOR', 'COASTERS_DOOR', 'J_MIDWAY_2'],
      HUGOS_DOOR: ['J_MIDWAY_1'],
      COASTERS_DOOR: ['J_MIDWAY_1'],

      J_MIDWAY_2: ['J_MIDWAY_1', 'FRENCH_DOOR', 'FRIAR_DOOR', 'J_MIDWAY_3'],
      FRENCH_DOOR: ['J_MIDWAY_2'],
      FRIAR_DOOR: ['J_MIDWAY_2'],

      J_MIDWAY_3: ['J_MIDWAY_2', 'PAVILION_DOOR', 'J_NORTH'],
      PAVILION_DOOR: ['J_MIDWAY_3', 'BREAKERS_DOOR'],
      BREAKERS_DOOR: ['PAVILION_DOOR'],

      J_NORTH: ['J_MIDWAY_3', 'BACKBEAT_DOOR', 'BAYHARBOR_DOOR', 'J_COASTER'],
      BACKBEAT_DOOR: ['J_NORTH'],
      BAYHARBOR_DOOR: ['J_NORTH'],
      J_COASTER: ['J_NORTH']
    };

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x62b6f6);
    this.scene.fog = new THREE.FogExp2(0x62b6f6, 0.004);

    // Camera
    this.camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 1000);
    this.camera.position.set(0, 50, 54);
    this.camera.lookAt(0, 2, -6);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff8e7, 1.4);
    dirLight.position.set(35, 65, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    this.scene.add(dirLight);

    // Build Environment & Seamless Road Network
    this.buildPeninsulaGeography();
    this.buildSeamlessRoadNetwork();
    this.buildPerimeterFence();
    this.buildEntranceGateAndTurnstiles();
    this.buildParkManager();
    this.buildAllSockets();
    this.buildCoasterStage(1);

    this.scene.add(this.coasterTrackGroup);
    this.spawnFreestyleMachinesAndDecorations();

    this.spawnPeeps(10);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  buildPeninsulaGeography() {
    const peninsulaGeo = new THREE.PlaneGeometry(60, 130);
    const peninsulaMat = new THREE.MeshStandardMaterial({ color: 0x48a138, roughness: 0.8 });
    const peninsula = new THREE.Mesh(peninsulaGeo, peninsulaMat);
    peninsula.rotation.x = -Math.PI / 2;
    peninsula.receiveShadow = true;
    this.scene.add(peninsula);

    // Lake Erie (East)
    const lakeGeo = new THREE.PlaneGeometry(80, 130);
    const lakeMat = new THREE.MeshStandardMaterial({ color: 0x0077be, roughness: 0.1, transparent: true, opacity: 0.85 });
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    lake.rotation.x = -Math.PI / 2;
    lake.position.set(65, 0.01, 0);
    this.scene.add(lake);

    // Beach
    const beachGeo = new THREE.PlaneGeometry(12, 110);
    const beachMat = new THREE.MeshStandardMaterial({ color: 0xe3ca96, roughness: 0.9 });
    const beach = new THREE.Mesh(beachGeo, beachMat);
    beach.rotation.x = -Math.PI / 2;
    beach.position.set(32, 0.02, 0);
    this.scene.add(beach);

    // Sandusky Bay (West)
    const bayGeo = new THREE.PlaneGeometry(80, 130);
    const bayMat = new THREE.MeshStandardMaterial({ color: 0x005599, roughness: 0.2, transparent: true, opacity: 0.85 });
    const bay = new THREE.Mesh(bayGeo, bayMat);
    bay.rotation.x = -Math.PI / 2;
    bay.position.set(-65, 0.01, 0);
    this.scene.add(bay);

    // Marina Piers
    const dockGroup = new THREE.Group();
    const dockMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.7 });
    for (let z = -10; z >= -30; z -= 8) {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(16, 0.4, 2.5), dockMat);
      pier.position.set(-28, 0.2, z);
      dockGroup.add(pier);

      const boat = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 2), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      boat.position.set(-34, 0.4, z);
      dockGroup.add(boat);
    }
    this.scene.add(dockGroup);
  }

  // PERIMETER PARK FENCE
  buildPerimeterFence() {
    const fenceGroup = new THREE.Group();
    const postMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8 });
    const railMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 });

    for (let z = -48; z <= 48; z += 6) {
      // West Fence (X: -28)
      const postW = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 8), postMat);
      postW.position.set(-28, 1.1, z);
      fenceGroup.add(postW);

      const railW = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 6), railMat);
      railW.position.set(-28, 1.5, z + 3);
      fenceGroup.add(railW);

      // East Fence (X: +28)
      const postE = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 8), postMat);
      postE.position.set(28, 1.1, z);
      fenceGroup.add(postE);

      const railE = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 6), railMat);
      railE.position.set(28, 1.5, z + 3);
      fenceGroup.add(railE);
    }
    this.scene.add(fenceGroup);
  }

  // SEAMLESS UNIFIED ROAD MESH (Zero Seams / Zero Z-Fighting)
  buildSeamlessRoadNetwork() {
    const roadGroup = new THREE.Group();
    const roadTexture = this.createPavingTexture();
    const roadMat = new THREE.MeshStandardMaterial({
      map: roadTexture,
      roughness: 0.65,
      metalness: 0.1
    });

    const shape = new THREE.Shape();

    // 1. Draw Main Midway Central Spine (X: -4 to +4)
    shape.moveTo(-4, -28);
    shape.lineTo(-16, -28); // Coaster Plaza
    shape.lineTo(-16, -24);
    shape.lineTo(-4, -24);

    // Bay Harbor Marina Branch (West)
    shape.lineTo(-4, -22);
    shape.lineTo(-24, -22);
    shape.lineTo(-24, -18);
    shape.lineTo(-4, -18);

    // BackBeatQue Branch (West)
    shape.lineTo(-4, -12);
    shape.lineTo(-12, -12);
    shape.lineTo(-12, -8);
    shape.lineTo(-4, -8);

    // French Quarter Branch (West)
    shape.lineTo(-4, 10);
    shape.lineTo(-12, 10);
    shape.lineTo(-12, 14);
    shape.lineTo(-4, 14);

    // Hugo's Pizza Branch (West)
    shape.lineTo(-4, 20);
    shape.lineTo(-12, 20);
    shape.lineTo(-12, 24);
    shape.lineTo(-4, 24);

    // Rentals Branch (West)
    shape.lineTo(-4, 30);
    shape.lineTo(-10, 30);
    shape.lineTo(-10, 34);
    shape.lineTo(-4, 34);

    // Entrance Gate (South Tip)
    shape.lineTo(-4, 44);
    shape.lineTo(4, 44);

    // Coasters Diner Branch (East)
    shape.lineTo(4, 24);
    shape.lineTo(12, 24);
    shape.lineTo(12, 20);
    shape.lineTo(4, 20);

    // Happy Friar Branch (East)
    shape.lineTo(4, 14);
    shape.lineTo(12, 14);
    shape.lineTo(12, 10);
    shape.lineTo(4, 10);

    // Grand Pavilion Branch (East)
    shape.lineTo(4, 4);
    shape.lineTo(16, 4);
    shape.lineTo(16, 0);

    // Hotel Breakers Boardwalk Extension
    shape.lineTo(4, 0);
    shape.lineTo(4, -6);
    shape.lineTo(28, -6);
    shape.lineTo(28, -2);
    shape.lineTo(16, -2);
    shape.lineTo(16, 0);
    shape.lineTo(4, 0);

    shape.lineTo(4, -28);
    shape.closePath();

    const shapeGeo = new THREE.ShapeGeometry(shape);
    const roadMesh = new THREE.Mesh(shapeGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.y = 0.03;
    roadMesh.receiveShadow = true;
    roadGroup.add(roadMesh);

    this.scene.add(roadGroup);
  }

  createPavingTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#DFBE92';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#C5A77F';
    ctx.lineWidth = 3;
    for (let x = 0; x <= 256; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y <= 256; y += 16) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 8);
    return texture;
  }

  buildEntranceGateAndTurnstiles() {
    const entranceGroup = new THREE.Group();
    entranceGroup.position.set(0, 0, 38);

    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 12, 2.4), new THREE.MeshStandardMaterial({ color: 0xe50914 }));
    leftPillar.position.set(-7, 6, 0);
    entranceGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 12, 2.4), new THREE.MeshStandardMaterial({ color: 0xe50914 }));
    rightPillar.position.set(7, 6, 0);
    entranceGroup.add(rightPillar);

    const arch = new THREE.Mesh(new THREE.BoxGeometry(18, 3, 1.6), new THREE.MeshStandardMaterial({ color: 0x003087 }));
    arch.position.set(0, 11.5, 0);
    entranceGroup.add(arch);

    const turnstileMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 });
    for (let xOffset of [-3, 3]) {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2, 8), turnstileMat);
      base.position.set(xOffset, 1, 0);
      entranceGroup.add(base);

      const barGroup = new THREE.Group();
      barGroup.position.set(xOffset, 1.2, 0);
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 2) {
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8), turnstileMat);
        bar.rotation.z = Math.PI / 2;
        bar.position.set(Math.cos(angle) * 0.9, 0, Math.sin(angle) * 0.9);
        barGroup.add(bar);
      }
      entranceGroup.add(barGroup);
      this.turnstileBars.push(barGroup);
    }

    this.scene.add(entranceGroup);
  }

  buildParkManager() {
    this.managerGroup = new THREE.Group();

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 1.4, 8), new THREE.MeshStandardMaterial({ color: 0x003087 }));
    body.position.y = 0.7;
    this.managerGroup.add(body);

    const vest = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.54, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0xffd700 }));
    vest.position.y = 0.8;
    this.managerGroup.add(vest);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffcc99 }));
    head.position.y = 1.6;
    this.managerGroup.add(head);

    const hat = new THREE.Mesh(new THREE.SphereGeometry(0.39, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xffea00, metalness: 0.3 }));
    hat.position.y = 1.75;
    this.managerGroup.add(hat);

    const badgeCanvas = document.createElement('canvas');
    badgeCanvas.width = 128;
    badgeCanvas.height = 128;
    const ctx = badgeCanvas.getContext('2d');
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(64, 64, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = '54px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👔', 64, 64);

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(badgeCanvas), transparent: true }));
    sprite.scale.set(2.4, 2.4, 1);
    sprite.position.set(0, 2.9, 0);
    this.managerGroup.add(sprite);

    this.managerGroup.position.set(0, 0, 24);
    this.scene.add(this.managerGroup);
  }

  // SOCKET RING PADS POSITIONED PRECISELY AT END OF SIDEWALKS
  buildAllSockets() {
    const socketPositions = [
      { id: 'rentals', pos: this.NODES.RENTALS_DOOR },
      { id: 'hugos', pos: this.NODES.HUGOS_DOOR },
      { id: 'coasters_diner', pos: this.NODES.COASTERS_DOOR },
      { id: 'french_quarter', pos: this.NODES.FRENCH_DOOR },
      { id: 'happy_friar', pos: this.NODES.FRIAR_DOOR },
      { id: 'grand_pavilion', pos: this.NODES.PAVILION_DOOR },
      { id: 'backbeat', pos: this.NODES.BACKBEAT_DOOR },
      { id: 'bay_harbor', pos: this.NODES.BAYHARBOR_DOOR },
      { id: 'coaster_stage2', pos: this.NODES.J_COASTER },
      { id: 'millennium_force', pos: this.NODES.J_COASTER },
      { id: 'hotel_breakers', pos: this.NODES.BREAKERS_DOOR },
      { id: 'castaway_bay', pos: this.NODES.CASTAWAY_DOOR }
    ];

    socketPositions.forEach(s => {
      const padGroup = new THREE.Group();
      padGroup.position.copy(s.pos);

      // Compact glowing ring pad fitting on 4m wide sidewalk pad
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.8, 2.4, 24),
        new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.05;
      padGroup.add(ring);

      this.sockets[s.id] = padGroup;
      this.scene.add(padGroup);
    });
  }

  // COCA-COLA FREESTYLE MACHINES, TREES, BUSHES & LIGHTING
  spawnFreestyleMachinesAndDecorations() {
    const freestylePositions = [
      new THREE.Vector3(4.8, 0, 32),
      new THREE.Vector3(-4.8, 0, 22),
      new THREE.Vector3(4.8, 0, 12),
      new THREE.Vector3(-4.8, 0, -10)
    ];

    freestylePositions.forEach(pos => {
      const station = new THREE.Group();
      station.position.copy(pos);

      const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.4, 1.0), new THREE.MeshStandardMaterial({ color: 0xe50914, roughness: 0.3 }));
      cabinet.position.y = 1.2;
      station.add(cabinet);

      const screen = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      screen.position.set(0, 1.8, 0.52);
      station.add(screen);

      this.scene.add(station);
    });

    const bushPositions = [
      new THREE.Vector3(-4.6, 0, 27),
      new THREE.Vector3(4.6, 0, 27),
      new THREE.Vector3(-4.6, 0, 17),
      new THREE.Vector3(4.6, 0, 17),
      new THREE.Vector3(-4.6, 0, 7),
      new THREE.Vector3(4.6, 0, 7)
    ];

    bushPositions.forEach(pos => {
      const bush = new THREE.Mesh(
        new THREE.SphereGeometry(0.9, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 })
      );
      bush.scale.set(1, 0.7, 1);
      bush.position.copy(pos);
      bush.position.y = 0.6;
      this.scene.add(bush);
    });

    const lampPositions = [
      new THREE.Vector3(-4.5, 0, 32),
      new THREE.Vector3(4.5, 0, 32),
      new THREE.Vector3(-4.5, 0, 22),
      new THREE.Vector3(4.5, 0, 22),
      new THREE.Vector3(-4.5, 0, 12),
      new THREE.Vector3(4.5, 0, 12)
    ];

    lampPositions.forEach(pos => {
      const lamp = new THREE.Group();
      lamp.position.copy(pos);

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4, 8), new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 }));
      post.position.y = 2;
      lamp.add(post);

      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffe066 }));
      globe.position.y = 4.1;
      lamp.add(globe);

      this.scene.add(lamp);
    });
  }

  guideManagerToBuild(socketId, buildingType) {
    const nodeKey = (socketId + '_DOOR').toUpperCase();
    const targetPos = this.NODES[nodeKey] || this.sockets[socketId]?.position || new THREE.Vector3(0, 0, 0);
    this.managerTarget.copy(targetPos);
    this.activeSocketId = socketId;
    this.activeBuildingType = buildingType;
    this.isManagerBuilding = true;
  }

  // BUILDINGS POSITIONED RIGHT BEHIND SOCKET PAD FACING STREET
  buildBuildingOnSocket(socketId, buildingType) {
    if (this.sockets[socketId]) {
      this.sockets[socketId].visible = false;
    }

    const pos = this.sockets[socketId] ? this.sockets[socketId].position : this.NODES.RENTALS_DOOR;
    const group = new THREE.Group();

    // Offset building model center behind the socket ring pad facing street
    let bOffsetX = 0;
    let bOffsetZ = 0;

    if (pos.x < 0) bOffsetX = -3.5; // West side: building behind socket pad
    else if (pos.x > 0) bOffsetX = 3.5; // East side: building behind socket pad

    group.position.set(pos.x + bOffsetX, pos.y, pos.z + bOffsetZ);

    if (buildingType === 'rentals') {
      const walls = new THREE.Mesh(new THREE.BoxGeometry(6.0, 3.8, 4.8), new THREE.MeshStandardMaterial({ color: 0x2b4c7e }));
      walls.position.y = 1.9;
      group.add(walls);
      const sign = this.createBuildingSignSprite('RENTALS & LOCKERS 🔑', '#2B4C7E');
      sign.position.set(0, 5.8, 0);
      group.add(sign);
    } else if (buildingType === 'hugos') {
      const walls = new THREE.Mesh(new THREE.BoxGeometry(6.5, 4.2, 5.2), new THREE.MeshStandardMaterial({ color: 0xb23b23 }));
      walls.position.y = 2.1;
      group.add(walls);
      this.addPatioTable(group, 0, 3.2, 0xe50914);
      const sign = this.createBuildingSignSprite('HUGOS PIZZA 🍕', '#B23B23');
      sign.position.set(0, 6.2, 0);
      group.add(sign);
    } else if (buildingType === 'coasters_diner') {
      const walls = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.8, 5.0), new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.8 }));
      walls.position.y = 1.9;
      group.add(walls);
      this.addPatioTable(group, 0, 3.2, 0x00ffff);
      const sign = this.createBuildingSignSprite('COASTERS DINER 🍔', '#FF6699');
      sign.position.set(0, 6.4, 0);
      group.add(sign);
    } else if (buildingType === 'french_quarter') {
      const walls = new THREE.Mesh(new THREE.BoxGeometry(6.0, 4.5, 4.8), new THREE.MeshStandardMaterial({ color: 0xe6c280 }));
      walls.position.y = 2.25;
      group.add(walls);
      const sign = this.createBuildingSignSprite('FRENCH QUARTER 🍰', '#9933CC');
      sign.position.set(0, 6.0, 0);
      group.add(sign);
    } else if (buildingType === 'happy_friar') {
      const walls = new THREE.Mesh(new THREE.BoxGeometry(5.8, 3.8, 4.2), new THREE.MeshStandardMaterial({ color: 0x5c4033 }));
      walls.position.y = 1.9;
      group.add(walls);
      const sign = this.createBuildingSignSprite('HAPPY FRIAR FRIES 🍟', '#E50914');
      sign.position.set(0, 6.8, 0);
      group.add(sign);
    } else if (buildingType === 'grand_pavilion') {
      const mainHall = new THREE.Mesh(new THREE.BoxGeometry(8.0, 6.5, 6.5), new THREE.MeshStandardMaterial({ color: 0xfaf0e6 }));
      mainHall.position.y = 3.25;
      group.add(mainHall);
      const sign = this.createBuildingSignSprite('GRAND PAVILION 🍸', '#003087');
      sign.position.set(0, 8.2, 0);
      group.add(sign);
    } else if (buildingType === 'backbeat') {
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(6.8, 4.2, 5.5), new THREE.MeshStandardMaterial({ color: 0x4a2e1d }));
      cabin.position.y = 2.1;
      group.add(cabin);
      const sign = this.createBuildingSignSprite('BACKBEATQUE BBQ 🍖', '#4A2E1D');
      sign.position.set(0, 6.4, 0);
      group.add(sign);
    } else if (buildingType === 'bay_harbor') {
      const restaurant = new THREE.Mesh(new THREE.BoxGeometry(7.5, 4.8, 5.8), new THREE.MeshStandardMaterial({ color: 0x1b365d }));
      restaurant.position.y = 2.4;
      group.add(restaurant);
      const sign = this.createBuildingSignSprite('BAY HARBOR SEAFOOD ⚓', '#1B365D');
      sign.position.set(0, 6.8, 0);
      group.add(sign);
    } else if (buildingType === 'hotel_breakers') {
      const hotelBody = new THREE.Mesh(new THREE.BoxGeometry(14, 16, 9.5), new THREE.MeshStandardMaterial({ color: 0xf8f8ff }));
      hotelBody.position.y = 8.0;
      group.add(hotelBody);
      const sign = this.createBuildingSignSprite('HOTEL BREAKERS 🏨', '#B22222');
      sign.position.set(0, 20.2, 0);
      group.add(sign);
    } else if (buildingType === 'castaway_bay') {
      const resort = new THREE.Mesh(new THREE.BoxGeometry(15, 12, 12), new THREE.MeshStandardMaterial({ color: 0x00a86b }));
      resort.position.y = 6.0;
      group.add(resort);
      const sign = this.createBuildingSignSprite('CASTAWAY BAY WATERPARK 🌊', '#00A86B');
      sign.position.set(0, 14.2, 0);
      group.add(sign);
    }

    this.buildings[buildingType] = group;
    this.scene.add(group);
    this.spawnConfettiBurst(pos.clone().add(new THREE.Vector3(0, 5, 0)));
  }

  createBuildingSignSprite(titleText, bgColorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColorHex;
    ctx.beginPath();
    ctx.roundRect(10, 10, 236, 60, 16);
    ctx.fill();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(titleText, 128, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
    sprite.scale.set(4.5, 1.4, 1);
    return sprite;
  }

  addPatioTable(parentGroup, x, z, umbrellaColorHex) {
    const tableGroup = new THREE.Group();
    tableGroup.position.set(x, 0, z);

    const table = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.8, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    table.position.y = 0.4;
    tableGroup.add(table);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    pole.position.y = 1.25;
    tableGroup.add(pole);

    const umbrella = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.8, 8), new THREE.MeshStandardMaterial({ color: umbrellaColorHex }));
    umbrella.position.y = 2.4;
    tableGroup.add(umbrella);

    parentGroup.add(tableGroup);
  }

  // 3-STAGE COASTER PROGRESSION POSITIONED STRICTLY IN REAR COASTER PLAZA (ZERO ROAD CLIPPING!)
  buildCoasterStage(stage) {
    this.coasterStage = stage;
    while (this.coasterTrackGroup.children.length > 0) {
      this.coasterTrackGroup.remove(this.coasterTrackGroup.children[0]);
    }
    this.trainUnits = [];

    let points = [];
    if (stage === 1) {
      // Stage 1: Rear Junior Coaster Loop (Strictly in North-West Coaster Zone)
      points = [
        new THREE.Vector3(-16, 2, -28),
        new THREE.Vector3(-16, 8, -38),
        new THREE.Vector3(-26, 10, -38),
        new THREE.Vector3(-34, 4, -34),
        new THREE.Vector3(-34, 2, -28),
        new THREE.Vector3(-26, 2, -28)
      ];
    } else if (stage === 2) {
      // Stage 2: Rear Thrill Loop Coaster
      points = [
        new THREE.Vector3(-16, 2, -28),
        new THREE.Vector3(-16, 14, -42),
        new THREE.Vector3(-26, 16, -44),
        new THREE.Vector3(-32, 4, -36),
        new THREE.Vector3(-26, 12, -32),
        new THREE.Vector3(-26, 20, -28),
        new THREE.Vector3(-26, 4, -24),
        new THREE.Vector3(-16, 2, -24)
      ];
    } else {
      // Stage 3: Rear Millennium Force Hypercoaster Peak
      points = [
        new THREE.Vector3(-16, 2, -28),
        new THREE.Vector3(-16, 18, -46),
        new THREE.Vector3(-16, 30, -52), // High Peak in back
        new THREE.Vector3(-28, 4, -40),   // 80° Drop
        new THREE.Vector3(-28, 14, -34),  // Loop
        new THREE.Vector3(-28, 24, -28),
        new THREE.Vector3(-28, 4, -22),
        new THREE.Vector3(-20, 16, -18),
        new THREE.Vector3(-16, 6, -20)
      ];
    }

    this.coasterCurve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.25);

    const tubeGeo = new THREE.TubeGeometry(this.coasterCurve, 180, stage === 3 ? 0.45 : 0.35, 8, true);
    const trackMesh = new THREE.Mesh(tubeGeo, new THREE.MeshStandardMaterial({ color: 0xe50914, metalness: 0.5 }));
    trackMesh.castShadow = true;
    this.coasterTrackGroup.add(trackMesh);

    const samples = 25 + stage * 10;
    for (let i = 0; i < samples; i++) {
      const t = i / samples;
      const pt = this.coasterCurve.getPointAt(t);
      if (pt.y > 1.2) {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, pt.y, 6), new THREE.MeshStandardMaterial({ color: 0xffd700 }));
        pillar.position.set(pt.x, pt.y / 2, pt.z);
        this.coasterTrackGroup.add(pillar);
      }
    }

    const cartCount = stage === 1 ? 2 : stage === 2 ? 3 : 4;
    for (let i = 0; i < cartCount; i++) {
      const unitGroup = new THREE.Group();
      if (i === 0) {
        const lead = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 2.6), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8 }));
        unitGroup.add(lead);
      } else {
        const cart = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 2.2), new THREE.MeshStandardMaterial({ color: 0x003087 }));
        unitGroup.add(cart);
      }
      this.coasterTrackGroup.add(unitGroup);
      this.trainUnits.push({ group: unitGroup, offset: i * 0.028 });
    }

    this.spawnConfettiBurst(new THREE.Vector3(-20, 8, -32));
  }

  spawnPeeps(count) {
    const shirtColors = [0xe50914, 0x003087, 0xffd700, 0x00a86b, 0xff69b4, 0x9b59b6];
    const destinationNodes = ['RENTALS_DOOR', 'HUGOS_DOOR', 'COASTERS_DOOR', 'FRENCH_DOOR', 'FRIAR_DOOR', 'PAVILION_DOOR', 'BACKBEAT_DOOR', 'BAYHARBOR_DOOR'];

    for (let i = 0; i < count; i++) {
      const peepGroup = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8), new THREE.MeshStandardMaterial({ color: shirtColors[Math.floor(Math.random() * shirtColors.length)] }));
      body.position.y = 0.6;
      peepGroup.add(body);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshStandardMaterial({ color: 0xffcc99 }));
      head.position.y = 1.4;
      peepGroup.add(head);

      const startPos = this.NODES.OUTSIDE.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2));
      peepGroup.position.copy(startPos);

      const destKey = destinationNodes[Math.floor(Math.random() * destinationNodes.length)];
      const nodePath = this.computeNodePath('OUTSIDE', destKey);

      peepGroup.userData = {
        currentNodeKey: 'OUTSIDE',
        nodePath: nodePath,
        pathIndex: 0,
        laneOffset: (Math.random() - 0.5) * 2.2,
        speed: 0.075 + Math.random() * 0.03, // Punchy, responsive walking speed!
        hopPhase: Math.random() * Math.PI * 2
      };

      this.scene.add(peepGroup);
      this.peeps.push(peepGroup);
    }
  }

  computeNodePath(startNodeKey, targetNodeKey) {
    if (startNodeKey === targetNodeKey) return [startNodeKey];

    const queue = [[startNodeKey]];
    const visited = new Set([startNodeKey]);

    while (queue.length > 0) {
      const path = queue.shift();
      const node = path[path.length - 1];

      if (node === targetNodeKey) {
        return path;
      }

      const neighbors = this.GRAPH[node] || [];
      for (let neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    return [startNodeKey, targetNodeKey];
  }

  spawnConfettiBurst(originPos) {
    const colors = [0xe50914, 0xffd700, 0x003087, 0x00ffff, 0xff00ff];
    for (let i = 0; i < 40; i++) {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), new THREE.MeshBasicMaterial({ color: colors[Math.floor(Math.random() * colors.length)], side: THREE.DoubleSide }));
      mesh.position.copy(originPos);
      mesh.userData = { vx: (Math.random() - 0.5) * 0.4, vy: Math.random() * 0.4 + 0.2, vz: (Math.random() - 0.5) * 0.4, life: 1.0 };
      this.scene.add(mesh);
      this.particles.push(mesh);
    }
  }

  // FLOATING THRILL ENERGY ORB (Replaces coins to avoid greed perception)
  spawnFloatingEnergyOrb(x, y, z) {
    const orb = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.5, 0),
      new THREE.MeshStandardMaterial({ color: 0xffea00, metalness: 0.8, roughness: 0.1, emissive: 0xffaa00, emissiveIntensity: 0.5 })
    );
    orb.position.set(x, y, z);
    orb.userData = { vy: 0.12, life: 1.0 };
    this.scene.add(orb);
    this.particles.push(orb);

    if (this.onCashEarned) this.onCashEarned(50); // Earns +50 Thrill Energy!
  }

  setBuildProgress(stepIndex, totalSteps) {
    this.buildProgressRatio = Math.min(1.0, stepIndex / totalSteps);
  }

  update() {
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // 0. DYNAMIC PROGRESSIVE CAMERA ZOOM-OUT
    const baseCamPos = new THREE.Vector3(0, 48, 52);
    const fullCamPos = new THREE.Vector3(0, 68, 72);

    const baseLook = new THREE.Vector3(0, 2, -6);
    const fullLook = new THREE.Vector3(0, -2, -12);

    this.targetCameraPos.lerpVectors(baseCamPos, fullCamPos, this.buildProgressRatio);
    this.targetLookAt.lerpVectors(baseLook, fullLook, this.buildProgressRatio);

    this.camera.position.lerp(this.targetCameraPos, 0.05);
    this.currentLookAt.lerp(this.targetLookAt, 0.05);
    this.camera.lookAt(this.currentLookAt);

    // 1. PARK MANAGER AVATAR (FAST RESPONSIVE WALKING)
    if (this.managerGroup) {
      const dx = this.managerTarget.x - this.managerGroup.position.x;
      const dz = this.managerTarget.z - this.managerGroup.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 0.5) {
        this.managerGroup.position.x += (dx / dist) * 0.28;
        this.managerGroup.position.z += (dz / dist) * 0.28;
        this.managerGroup.rotation.y = Math.atan2(dx, dz);
        this.managerGroup.position.y = Math.abs(Math.sin(time * 12)) * 0.25;
      } else if (this.isManagerBuilding) {
        this.managerGroup.position.y = Math.abs(Math.sin(time * 22)) * 0.4;
        if (Math.random() < 0.15) {
          this.buildBuildingOnSocket(this.activeSocketId, this.activeBuildingType);
          this.isManagerBuilding = false;
        }
      }
    }

    // 2. COASTER TRAIN
    if (this.coasterCurve && this.trainUnits.length > 0) {
      this.trainProgress += this.trainSpeed;
      if (this.trainProgress > 1) this.trainProgress = 0;

      this.trainUnits.forEach(unit => {
        const tCar = (this.trainProgress - unit.offset + 1.0) % 1.0;
        const pos = this.coasterCurve.getPointAt(tCar);
        const tangent = this.coasterCurve.getTangentAt(tCar);
        unit.group.position.copy(pos);
        unit.group.lookAt(pos.clone().add(tangent));
      });

      if (Math.random() < 0.08 && this.trainUnits[0]) {
        const leadPos = this.trainUnits[0].group.position;
        this.spawnFloatingEnergyOrb(leadPos.x, leadPos.y + 1, leadPos.z);
      }
    }

    // 3. TURNSTILES
    this.turnstileBars.forEach(barGroup => {
      barGroup.rotation.y += 0.025;
    });

    // 4. ORDERLY PEEP MOVEMENT
    const destinationNodes = ['RENTALS_DOOR', 'HUGOS_DOOR', 'COASTERS_DOOR', 'FRENCH_DOOR', 'FRIAR_DOOR', 'PAVILION_DOOR', 'BACKBEAT_DOOR', 'BAYHARBOR_DOOR'];

    this.peeps.forEach(peep => {
      const nextNodeKey = peep.userData.nodePath[peep.userData.pathIndex];
      let targetPos = this.NODES[nextNodeKey].clone();

      if (Math.abs(targetPos.x - peep.position.x) < 0.8) {
        targetPos.x += peep.userData.laneOffset;
      } else {
        targetPos.z += peep.userData.laneOffset * 0.5;
      }

      const dx = targetPos.x - peep.position.x;
      const dz = targetPos.z - peep.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist > 0.8) {
        peep.position.x += (dx / dist) * peep.userData.speed;
        peep.position.z += (dz / dist) * peep.userData.speed;
        peep.rotation.y = Math.atan2(dx, dz);

        peep.userData.hopPhase += 0.18;
        peep.position.y = Math.abs(Math.sin(peep.userData.hopPhase)) * 0.22;
      } else {
        peep.userData.pathIndex++;

        if (peep.userData.pathIndex >= peep.userData.nodePath.length) {
          if (Math.random() < 0.5) {
            this.spawnFloatingEnergyOrb(peep.position.x, peep.position.y + 1.5, peep.position.z);
          }

          const currentKey = peep.userData.nodePath[peep.userData.nodePath.length - 1];
          const newDestKey = destinationNodes[Math.floor(Math.random() * destinationNodes.length)];
          const newPath = this.computeNodePath(currentKey, newDestKey);

          peep.userData.nodePath = newPath;
          peep.userData.pathIndex = 0;
        }
      }
    });

    // 5. PARTICLES
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (p.userData.vy !== undefined) {
        p.position.y += p.userData.vy;
        p.rotation.y += 0.1;
        p.userData.life -= delta * 1.5;
      }
      if (p.userData.life <= 0) {
        this.scene.remove(p);
        this.particles.splice(i, 1);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}
