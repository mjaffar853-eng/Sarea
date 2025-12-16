import * as THREE from 'three'
import Obstacle from './Obstacle.js'
import Experience from '../../Experience.js'

const OBSTACLES_SCALING = {
    type1: 0.12, 
    type2: 0.2, 
    type3: 0.1, 
    type4: 0.25, 
}

export default class ObstacleFactory {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources.items

        this.obstacleModels = {
            type1Obstacle: this.resources.type1Obstacle,        
            type2Obstacle: this.resources.type2Obstacle,        
            type3Obstacle: this.resources.type3Obstacle,        
            type4Obstacle: this.resources.type4Obstacle,               
        }

        this.types = {
            type1: () => this.createObstacleFromModel('type1Obstacle', OBSTACLES_SCALING.type1, 'type1'),
            type2: () => this.createObstacleFromModel('type2Obstacle', OBSTACLES_SCALING.type2, 'type2'),
            type3: () => this.createObstacleFromModel('type3Obstacle', OBSTACLES_SCALING.type3, 'type3'),
            type4: () => this.createObstacleFromModel('type4Obstacle', OBSTACLES_SCALING.type4, 'type4'),
        }
    }

    create(type) {
        if (!this.types[type]) {
            console.warn(`Obstacle type "${type}" not found, using fallback.`)
            return this.createFallbackObstacle()
        }
        return this.types[type]()
    }

    createObstacleFromModel(modelKey, scale = 1, type) {
        const model = this.obstacleModels[modelKey]
        if (!model) {
            console.warn(`Model "${modelKey}" not found, using fallback.`)
            return this.createFallbackObstacle()
        }

        const modelScene = model.scene.clone()
        modelScene.scale.set(scale, scale, scale)

        modelScene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        return new Obstacle(modelScene, type)
    }

    createFallbackObstacle() {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshStandardMaterial({ color: 0xff0000 })
        return new Obstacle(new THREE.Mesh(geometry, material))
    }
}
