import {
  ACESFilmicToneMapping,
  AmbientLight,
  AxesHelper,
  Clock,
  GridHelper,
  LoadingManager,
  Mesh,
  MeshStandardMaterial,
  //NeutralToneMapping,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PointLight,
  PointLightHelper,
  Scene,
  WebGLRenderer,
} from 'three'
import { DragControls } from 'three/addons/controls/DragControls.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Cube from './cube'
import Plane from './plane'
import { toggleFullScreen } from './helpers/fullscreen'
import { resizeRendererToDisplaySize } from './helpers/responsiveness'

export default class SceneApp {
canvas: HTMLElement;
clock: Clock;
renderer: WebGLRenderer;
sceneApp: Scene;

loadingManager: LoadingManager;

ambientLight: AmbientLight;
pointLight: PointLight;

camera: PerspectiveCamera;
cameraControls: OrbitControls;
dragControls: DragControls;

cube: Cube;
plane: Plane;
axesHelper: AxesHelper;
pointLightHelper: PointLightHelper;

animation = { enabled: true, play: true }

constructor(node: HTMLElement | null = null, clock: Clock) {
  // ===== RENDERER, 🖼 CANVAS & 🎬 SCENE =====
  {
    this.renderer = new WebGLRenderer({
       /*canvas,*/
       antialias: true,
       alpha: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    //this.renderer.toneMapping = NeutralToneMapping;
    this.renderer.toneMapping = ACESFilmicToneMapping; // NeutralToneMapping
    if (node === null)
      document.body.appendChild(this.renderer.domElement);
    else
      node.appendChild(this.renderer.domElement);
    this.canvas = this.renderer.domElement;
    //this.canvas = document.querySelector(`canvas#${CANVAS_ID}`)!;
    this.sceneApp = new Scene();
  }

  // ===== ⏲️ CLOCK =====
  {
    this.clock = clock;
  }

  // ===== 👨🏻‍💼 LOADING MANAGER =====
  {
    this.loadingManager = new LoadingManager();

    this.loadingManager.onStart = () => {
      console.log('loading started');
    }
    this.loadingManager.onProgress = (url, loaded, total) => {
      console.log('loading in progress:');
      console.log(`${url} -> ${loaded} / ${total}`);
    }
    this.loadingManager.onLoad = () => {
      console.log('loaded!');
    }
    this.loadingManager.onError = () => {
      console.log('❌ error while loading');
    }
  }

  // ===== 🎥 CAMERA =====
  {
    this.camera = new PerspectiveCamera(
      75,
      this.canvas.clientWidth / this.canvas.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(2, 2, 5)
  }

  // ===== 💡 LIGHTS =====
  {
    this.ambientLight = new AmbientLight('white', 0.4);
    this.sceneApp.add(this.ambientLight);
    
    this.pointLight = new PointLight('white', 20, 100);
    this.pointLight.position.set(-2, 2, 2);
    this.pointLight.castShadow = true;
    this.pointLight.shadow.radius = 4;
    this.pointLight.shadow.camera.near = 0.5;
    this.pointLight.shadow.camera.far = 1000;
    this.pointLight.shadow.mapSize.width = 2048;
    this.pointLight.shadow.mapSize.height = 2048;
    this.sceneApp.add(this.pointLight);
  }

  // ===== 📦 OBJECTS =====
  {
    this.cube = new Cube();
    this.sceneApp.add(this.cube)

    // ==== 🗺️ WORLD ====
    this.plane = new Plane();
    this.sceneApp.add(this.plane)
  }

  // ===== 🕹️ CONTROLS =====
  {
    this.cameraControls = new OrbitControls(this.camera, this.canvas)
    this.cameraControls.target = this.cube.position.clone()
    this.cameraControls.enableDamping = true
    this.cameraControls.autoRotate = false
    this.cameraControls.update()

    this.dragControls = new DragControls([this.cube], this.camera, this.renderer.domElement)
    this.dragControls.addEventListener('hoveron', (event) => {
      const mesh = event.object as Mesh
      const material = mesh.material as MeshStandardMaterial
      material.emissive.set('orange')
    })
    this.dragControls.addEventListener('hoveroff', (event) => {
      const mesh = event.object as Mesh
      const material = mesh.material as MeshStandardMaterial
      material.emissive.set('black')
    })
    this.dragControls.addEventListener('dragstart', (event) => {
      const mesh = event.object as Mesh
      const material = mesh.material as MeshStandardMaterial
      this.cameraControls.enabled = false
      this.animation.play = false
      material.emissive.set('black')
      material.opacity = 0.7
      material.needsUpdate = true
    })
    this.dragControls.addEventListener('dragend', (event) => {
      this.cameraControls.enabled = true
      this.animation.play = true
      const mesh = event.object as Mesh
      const material = mesh.material as MeshStandardMaterial
      material.emissive.set('black')
      material.opacity = 1
      material.needsUpdate = true
    })
    this.dragControls.enabled = false

    // Full screen
    window.addEventListener('dblclick', (event) => {
      if (event.target === this.canvas) {
        toggleFullScreen(this.canvas)
      }
    })
  }

  // ===== 🪄 HELPERS =====
  {
    this.axesHelper = new AxesHelper(4)
    this.axesHelper.visible = false
    this.sceneApp.add(this.axesHelper)

    this.pointLightHelper = new PointLightHelper(this.pointLight, undefined, 'orange')
    this.pointLightHelper.visible = false
    this.sceneApp.add(this.pointLightHelper)

    const gridHelper = new GridHelper(20, 20, 'teal', 'darkgray')
    gridHelper.position.y = -0.01
    this.sceneApp.add(gridHelper)
  }
}

animate() {
  //requestAnimationFrame(this.animate.bind(this))
  if (this.animation.enabled && this.animation.play) {
    this.cube.update(this.clock);
  }

  if (resizeRendererToDisplaySize(this.renderer)) {
    const canvas = this.renderer.domElement
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight
    this.camera.updateProjectionMatrix()
  }

  this.cameraControls.update()
  this.renderer.render(this.sceneApp, this.camera)
}
}