import * as THREE from 'three'
import Debug from './Utils/Debug.js'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'
import sources from './sources.js'
import EventEmitter from './Utils/EventEmitter.js'
import AudioManager from './World/Managers/AudioManager.js'
import UIManager from './UI/UIManager.js'
import InputHandler from './Systems/InputHandler.js'
import Events from '../../static/Configs/Events.js'

let instance = null

export default class Experience {
    constructor(_canvas) {
        // Singleton
        if (instance) {
            return instance
        }
        instance = this

        // Global access
        window.experience = this

        // Options
        this.canvas = _canvas

        // Setup
        this.debug = new Debug()
        this.sizes = new Sizes()
        this.time = new Time()
        this.eventEmitter = new EventEmitter()
        this.scene = new THREE.Scene()
        this.resources = new Resources(sources, this.eventEmitter)
        this.camera = new Camera()
        this.audioManager = new AudioManager()
        this.uiManager = new UIManager()
        this.inputHandler = new InputHandler()
        this.renderer = new Renderer()
        this.world = new World()
        this.isPaused = false
        // Resize event
        this.sizes.on(Events.Resize, () => {
            this.resize()
        })

        // Time tick event
        this.time.on(Events.Tick, () => {
            this.update()
        })
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()
    }

    update() {
        if(this.isPaused) return
        this.camera.update()
        this.world.update()
        this.renderer.update()
        this.uiManager.update()
    }

    destroy() {
        this.sizes.off(Events.Resize)
        this.time.off(Events.Tick)

        // Traverse the whole scene
        this.scene.traverse((child) => {
            // Test if it's a mesh
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose()

                // Loop through the material properties
                for (const key in child.material) {
                    const value = child.material[key]

                    // Test if there is a dispose function
                    if (value && typeof value.dispose === 'function') {
                        value.dispose()
                    }
                }
            }
        })

        this.camera.controls.dispose()
        this.renderer.instance.dispose()

        if (this.debug.active)
            this.debug.ui.destroy()
    }
}
