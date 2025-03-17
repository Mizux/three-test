import {
  AmbientLight,
  AxesHelper,
  BoxGeometry,
  Clock,
  GridHelper,
  LoadingManager,
  Mesh,
  MeshLambertMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  PointLightHelper,
  Scene,
  WebGLRenderer,
} from 'three'
import { DragControls } from 'three/addons/controls/DragControls.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import * as animations from './helpers/animations'
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

cube: Mesh;
plane: Mesh;
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
    if (node === null)
      document.body.appendChild(this.renderer.domElement);
    else
      node.appendChild(this.renderer.domElement);
    this.canvas = this.renderer.domElement;
    //this.canvas = document.querySelector(`canvas#${CANVAS_ID}`)!;
    this.sceneApp = new Scene();
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

  // ===== 💡 LIGHTS =====
  {
    this.ambientLight = new AmbientLight('white', 0.4);
    this.pointLight = new PointLight('white', 20, 100);
    this.pointLight.position.set(-2, 2, 2);
    this.pointLight.castShadow = true;
    this.pointLight.shadow.radius = 4;
    this.pointLight.shadow.camera.near = 0.5;
    this.pointLight.shadow.camera.far = 4000;
    this.pointLight.shadow.mapSize.width = 2048;
    this.pointLight.shadow.mapSize.height = 2048;
    this.sceneApp.add(this.ambientLight);
    this.sceneApp.add(this.pointLight);
  }

  // ===== 📦 OBJECTS =====
  {
    const sideLength = 1
    const cubeGeometry = new BoxGeometry(sideLength, sideLength, sideLength)
    const cubeMaterial = new MeshStandardMaterial({
      color: '#f69f1f',
      metalness: 0.5,
      roughness: 0.7,
    })
    this.cube = new Mesh(cubeGeometry, cubeMaterial)
    this.cube.castShadow = true
    this.cube.position.y = 0.5

    // ==== 🗺️ WORLD ====
    const planeGeometry = new PlaneGeometry(3, 3)
    const planeMaterial = new MeshLambertMaterial({
      color: 'gray',
      emissive: 'teal',
      emissiveIntensity: 0.2,
      side: 2,
      transparent: true,
      opacity: 0.4,
    })
    this.plane = new Mesh(planeGeometry, planeMaterial)
    this.plane.rotateX(Math.PI / 2)
    this.plane.receiveShadow = true

    this.sceneApp.add(this.cube)
    this.sceneApp.add(this.plane)
  }

  // ===== 🎥 CAMERA =====
  {
    this.camera = new PerspectiveCamera(50, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 100)
    this.camera.position.set(2, 2, 5)
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

  // ===== ⏲️ CLOCK =====
  {
    this.clock = clock;
  }
}

animate() {
  //requestAnimationFrame(this.animate.bind(this))
  if (this.animation.enabled && this.animation.play) {
    animations.rotate(this.cube, this.clock, Math.PI / 3)
    animations.bounce(this.cube, this.clock, 1, 0.5, 0.5)
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