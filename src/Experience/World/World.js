import Experience from '../Experience.js'
import InputHandler from '../Systems/InputHandler.js'
import Environment from './Environment.js'
import Car from './Car.js'
import City from './City.js'
import ObstacleManager from './Managers/ObstacleManager.js'
import CollectableFactory from './Collectables/CollectableFactory.js'
import CollectableManager from './Managers/CollectableManager.js'
import ObstacleFactory from './Obstacles/ObstacleFactory.js'
import SpawnManager from './Managers/SpawnManager.js'
import Events from '../../../static/Configs/Events.js'

export default class World {
    constructor() {
        this.experience = new Experience()
        this.eventEmitter = this.experience.eventEmitter
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.camera = this.experience.camera

        this.isGameOver = false

        this.eventEmitter.on(Events.GameStart, () => {
            this.experience.isPaused = false
            this.clearWorld()
            this.initWorld()
        })
    }

    initWorld() {
        this.isGameOver = false
        this.car = new Car()
        this.city = new City(this.car)
        this.environment = new Environment()

        // Factories
        this.obstacleFactory = new ObstacleFactory()
        this.collectableFactory = new CollectableFactory()

        // Managers
        this.obstacleManager = new ObstacleManager(this.obstacleFactory)
        this.collectableManager = new CollectableManager(this.collectableFactory, this.car)

        // Unified spawn system
        this.spawnManager = new SpawnManager(this.car)
        this.spawnManager.registerManager(this.obstacleManager, 'obstacle')
        this.spawnManager.registerManager(this.collectableManager, 'collectable')

        this.registerEvents()
    }

    registerEvents() {
        this.eventEmitter.on(Events.GameOver + '.world', () => this.gameOver())
    }

    gameOver() {
        this.isGameOver = true
    }

    /**
     * Cleans up all game objects, meshes, and memory before restarting.
     */
    clearWorld() {
        // Remove all objects from the scene
        this.scene.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose()
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach((mat) => mat.dispose())
                    } else {
                        child.material.dispose()
                    }
                }
            }
        })

        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0])
        }

        this.eventEmitter.off(Events.GameOver + '.world')
        this.eventEmitter.off(Events.Left + '.car')
        this.eventEmitter.off(Events.Right + '.car')
        this.eventEmitter.off(Events.ChargePickup + '.car')
        this.eventEmitter.off(Events.ObstacleCollision + '.car')
        this.eventEmitter.off(Events.ChargeSavePickup + '.car')
        this.eventEmitter.off(Events.RimProtectorPickup + '.car')

        // Dispose and nullify all game objects
        const disposables = [
            'inputHandler', 'car', 'city', 'environment',
            'obstacleFactory', 'collectableFactory',
            'obstacleManager', 'collectableManager', 'spawnManager'
        ]

        disposables.forEach((key) => {
            if (this[key]) {
                if (typeof this[key].dispose === 'function') {
                    this[key].dispose()
                }
                this[key] = null
            }
        })
    }

    update() {
        if (this.isGameOver) return

        if (this.car) {
            this.car.update()
            this.camera.update(this.car.model.position)
            this.environment.update(this.car.model.position)
            this.spawnManager.update(this.experience.time.delta * 0.001)
        }

        if (this.city) {
            this.city.update()
        }
    }
}
