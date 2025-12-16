import * as THREE from 'three'
import Experience from './Experience.js'
import gsap from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera {
    constructor() {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas

        this.setInstance()
        // this.setControls()

        // store the initial offset relative to player (initially assumed player at 0,0,0)
        this.offset = new THREE.Vector3(
            this.instance.position.x,
            this.instance.position.y,
            this.instance.position.z
        )
    }
    
    setInstance() {
        const fov = window.innerWidth < 500 ? 40 : 30 

        this.instance = new THREE.PerspectiveCamera(
            fov,
            this.sizes.width / this.sizes.height,
            0.5,
            80
        )
        this.instance.position.set(0, 1, 3)
        this.scene.add(this.instance)
    }

    setControls() {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
    }

    resize() {
        this.instance.fov = window.innerWidth < 500 ? 40 : 30
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    /**
     * Smoothly follows the player while maintaining the initial offset
     * @param {THREE.Vector3} playerPosition - current player position
    */
    followPlayer(playerPosition) {
        if (!playerPosition) return

        const target = new THREE.Vector3().addVectors(playerPosition, this.offset)

        gsap.to(this.instance.position, {
            x: target.x,
            y: target.y,
            z: target.z,
            duration: 0,
            ease: 'power2.out'
        })

        this.instance.lookAt(this.instance.position.x, playerPosition.y, playerPosition.z - 2.5)
    }

    update(playerPosition) {
        // this.controls.update()
        this.followPlayer(playerPosition)
    }
}
