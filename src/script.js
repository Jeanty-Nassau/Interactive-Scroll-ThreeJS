import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

const canvas = document.querySelector('canvas.webgl')
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const scene = new THREE.Scene()

const material = new THREE.MeshToonMaterial({ color: '#f7f7f2' })
const accentMaterial = new THREE.MeshToonMaterial({ color: '#ff991c' })
const cobaltMaterial = new THREE.MeshToonMaterial({ color: '#91a7ff' })

const mesh1 = new THREE.Mesh(
  new THREE.TorusGeometry(1, 0.35, 24, 80),
  cobaltMaterial
)
const mesh2 = new THREE.Mesh(
  new THREE.ConeGeometry(1, 2, 48),
  material
)
const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.78, 0.26, 120, 20),
  accentMaterial
)

const objectsDistance = 4
mesh1.position.set(2.25, -objectsDistance * 0, 0)
mesh2.position.set(-2.15, -objectsDistance * 1, 0)
mesh3.position.set(2.15, -objectsDistance * 2, 0)

const sectionMeshes = [mesh1, mesh2, mesh3]
scene.add(...sectionMeshes)

const particlesCount = 260
const positions = new Float32Array(particlesCount * 3)

for (let index = 0; index < particlesCount; index += 1) {
  positions[index * 3] = (Math.random() - 0.5) * 10
  positions[index * 3 + 1] =
    objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length
  positions[index * 3 + 2] = (Math.random() - 0.5) * 10
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3)
)

const particles = new THREE.Points(
  particlesGeometry,
  new THREE.PointsMaterial({
    color: '#91a7ff',
    sizeAttenuation: true,
    size: 0.035,
    transparent: true,
    opacity: 0.7,
  })
)
scene.add(particles)

const directionalLight = new THREE.DirectionalLight('#ffffff', 1.6)
directionalLight.position.set(1, 1, 2)
scene.add(directionalLight)

const orangeLight = new THREE.PointLight('#ff991c', 1.2, 14)
orangeLight.position.set(-2, 1, 3)
scene.add(orangeLight)

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
)
camera.position.z = 6
cameraGroup.add(camera)

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  powerPreference: 'high-performance',
})
renderer.setClearColor(0x05070b, 1)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

let scrollY = window.scrollY
let currentSection = 0

window.addEventListener(
  'scroll',
  () => {
    scrollY = window.scrollY
    const nextSection = Math.min(
      sectionMeshes.length - 1,
      Math.max(0, Math.round(scrollY / sizes.height))
    )

    if (nextSection !== currentSection) {
      currentSection = nextSection

      if (!prefersReducedMotion) {
        gsap.to(sectionMeshes[currentSection].rotation, {
          duration: 1.25,
          ease: 'power2.inOut',
          x: '+=5',
          y: '+=2.5',
        })
      }
    }
  },
  { passive: true }
)

const cursor = { x: 0, y: 0 }

window.addEventListener(
  'pointermove',
  (event) => {
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
  },
  { passive: true }
)

const clock = new THREE.Clock()
let previousTime = 0

function tick() {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  if (!prefersReducedMotion) {
    sectionMeshes.forEach((mesh, index) => {
      mesh.rotation.x += deltaTime * (0.08 + index * 0.025)
      mesh.rotation.y += deltaTime * (0.11 + index * 0.02)
    })
  }

  camera.position.y = (-scrollY / sizes.height) * objectsDistance

  const parallaxX = cursor.x * 0.5
  const parallaxY = -cursor.y * 0.5

  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime

  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}

tick()
