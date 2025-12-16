import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Environment {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('environment')
        }

        this.setSunLight()
        this.setAmbientLight()
        this.setEnvironmentMap()
    }

    setAmbientLight() {
        this.ambientLight = new THREE.AmbientLight('rgb(190, 190, 186)', 1)
        this.scene.add(this.ambientLight)
    }

    setSunLight() {
        this.sunLight = new THREE.DirectionalLight('rgb(255, 255, 255)', 2.5)
        this.sunLight.castShadow = false
        this.sunLight.shadow.mapSize.set(1024, 1024)
        this.sunLight.shadow.normalBias = 0.05

        // Shadow camera settings
        this.sunLight.shadow.camera.left = -10
        this.sunLight.shadow.camera.right = 10
        this.sunLight.shadow.camera.top = 10
        this.sunLight.shadow.camera.bottom = -10
        this.sunLight.shadow.camera.near = 0.0001
        this.sunLight.shadow.camera.far = 100

        this.scene.add(this.sunLight)
        this.scene.add(this.sunLight.target)

        this.shadowHelper = new THREE.CameraHelper(this.sunLight.shadow.camera)
        // this.scene.add(this.shadowHelper)

        // Helper (create once)
        this.lightHelper = new THREE.DirectionalLightHelper(this.sunLight, 0.5)
        // this.scene.add(this.lightHelper)
        // Debug
        if (this.debug.active) {
            this.debugFolder
                .add(this.sunLight, 'intensity')
                .name('sunLightIntensity')
                .min(0)
                .max(10)
                .step(0.001)

            this.debugFolder
                .add(this.sunLight.position, 'x')
                .name('sunLightX')
                .min(- 5)
                .max(5)
                .step(0.001)

            this.debugFolder
                .add(this.sunLight.position, 'y')
                .name('sunLightY')
                .min(- 5)
                .max(5)
                .step(0.001)

            this.debugFolder
                .add(this.sunLight.position, 'z')
                .name('sunLightZ')
                .min(- 5)
                .max(5)
                .step(0.001)
        }
    }

    setEnvironmentMap() {
        this.environmentMap = {}
        this.environmentMap.intensity = 1.6
        this.environmentMap.texture = this.resources.items.environmentMapTexture
        this.environmentMap.texture.colorSpace = THREE.SRGBColorSpace

        this.scene.environment = this.environmentMap.texture
        this.scene.background = new THREE.Color('#87CEEB')


        this.environmentMap.updateMaterials = () => {
            this.scene.traverse((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                    child.material.envMap = this.environmentMap.texture
                    child.material.envMapIntensity = this.environmentMap.intensity
                    child.material.needsUpdate = true
                }

                // car top glass material env map intensity is made 0.1
                if (child.name === 'Mesh_9_3') {
                    child.material.envMapIntensity = 0.1
                    child.material.needsUpdate = true;
                }
            })
        }
        this.environmentMap.updateMaterials()

        // Debug
        if (this.debug.active) {
            this.debugFolder
                .add(this.environmentMap, 'intensity')
                .name('envMapIntensity')
                .min(0)
                .max(4)
                .step(0.001)
                .onChange(this.environmentMap.updateMaterials)
        }
    }

    update(carPosition) {
        this.sunLight.position.set(carPosition.x + 2.5, carPosition.y + 4, carPosition.z + 10.5)

        this.sunLight.target.position.set(carPosition.x, carPosition.y, carPosition.z)
        this.sunLight.target.updateMatrixWorld()

        this.lightHelper.update()
        this.shadowHelper.update()
    }
}