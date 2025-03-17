import GUI from 'lil-gui'
import {
  Clock,
  MeshStandardMaterial,
} from 'three'
import Stats from 'stats.js'
import SceneApp from './scene'
import './style.css'

let clock: Clock
let stats: Stats
let gui: GUI
let sceneApp: SceneApp

function init() {
  // ===== 📈 STATS & ⏲️ CLOCK =====
  {
    clock = new Clock()
    stats = new Stats()
    document.body.appendChild(stats.dom)
  }

  // ==== SCENE ====
  {
    sceneApp = new SceneApp(null, clock);
  }

  // ==== 🐞 DEBUG GUI ====
  {
    gui = new GUI({ title: '🐞 Debug GUI', width: 300 })

    const cubeOneFolder = gui.addFolder('Cube one')

    cubeOneFolder.add(sceneApp.cube.position, 'x').min(-5).max(5).step(0.5).name('pos x')
    cubeOneFolder
      .add(sceneApp.cube.position, 'y')
      .min(-5)
      .max(5)
      .step(1)
      .name('pos y')
      .onChange(() => (sceneApp.animation.play = false))
      .onFinishChange(() => (sceneApp.animation.play = true))
    cubeOneFolder.add(sceneApp.cube.position, 'z').min(-5).max(5).step(0.5).name('pos z')

    cubeOneFolder.add(sceneApp.cube.material as MeshStandardMaterial, 'wireframe')
    cubeOneFolder.addColor(sceneApp.cube.material as MeshStandardMaterial, 'color')
    cubeOneFolder.add(sceneApp.cube.material as MeshStandardMaterial, 'metalness', 0, 1, 0.1)
    cubeOneFolder.add(sceneApp.cube.material as MeshStandardMaterial, 'roughness', 0, 1, 0.1)

    cubeOneFolder
      .add(sceneApp.cube.rotation, 'x', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
      .name('rotate x')
    cubeOneFolder
      .add(sceneApp.cube.rotation, 'y', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
      .name('rotate y')
      .onChange(() => (sceneApp.animation.play = false))
      .onFinishChange(() => (sceneApp.animation.play = true))
    cubeOneFolder
      .add(sceneApp.cube.rotation, 'z', -Math.PI * 2, Math.PI * 2, Math.PI / 4)
      .name('rotate z')

    cubeOneFolder.add(sceneApp.animation, 'enabled').name('animated')

    const cameraFolder = gui.addFolder('Camera')
    cameraFolder.add(sceneApp.cameraControls, 'autoRotate')

    const controlsFolder = gui.addFolder('Controls')
    controlsFolder.add(sceneApp.dragControls, 'enabled').name('drag controls')

    const lightsFolder = gui.addFolder('Lights')
    lightsFolder.add(sceneApp.pointLight, 'visible').name('point light')
    lightsFolder.add(sceneApp.ambientLight, 'visible').name('ambient light')

    const helpersFolder = gui.addFolder('Helpers')
    helpersFolder.add(sceneApp.axesHelper, 'visible').name('axes')
    helpersFolder.add(sceneApp.pointLightHelper, 'visible').name('pointLight')

    // persist GUI state in local storage on changes
    gui.onFinishChange(() => {
      const guiState = gui.save()
      localStorage.setItem('guiState', JSON.stringify(guiState))
    })

    // load GUI state if available in local storage
    const guiState = localStorage.getItem('guiState')
    if (guiState) gui.load(JSON.parse(guiState))

    // reset GUI state button
    const resetGui = () => {
      localStorage.removeItem('guiState')
      gui.reset()
    }
    gui.add({ resetGui }, 'resetGui').name('RESET')
    gui.close()
  }
}
init()

function animate() {
  requestAnimationFrame(animate)
  //this.stats.update()
  stats.begin()
  sceneApp.animate();
  stats.end()
}
animate()