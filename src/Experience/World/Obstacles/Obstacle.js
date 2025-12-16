import * as THREE from 'three'
import Experience from '../../Experience.js'
import GameConfig from '../../../../static/Configs/GameConfig.js'
import Events from '../../../../static/Configs/Events.js'

export default class Obstacle {
    constructor(model, type) {
        this.experience = new Experience()
        this.eventEmitter = this.experience.eventEmitter
        this.resources = this.experience.resources
        this.audioManager = this.experience.audioManager
        this.model = model
        this.boundingBox = new THREE.Box3().setFromObject(this.model)
        this.type = type
        this.active = false
        this.damage = GameConfig.obstacleConfig[this.type].damage
    }

    spawn(x, z) {
        this.model.position.set(x, 0, z)
        this.model.visible = true
        this.active = true
        this.boundingBox.setFromObject(this.model)
    }

    update() {
        if (!this.active) return
        this.boundingBox.setFromObject(this.model)
    }

    onCollision() {
        this.experience.eventEmitter.trigger(Events.ObstacleCollision, [{
            damage: this.damage
        }])
        this.playAudio()
        this.dispose()
    }

    playAudio() {
        this.audioManager.create('obstacleAudio', {
            buffer: this.resources.items['obstacleAudio'],
            type: 'global',
            loop: false,
            volume: 1,
        })
        this.audioManager.play('obstacleAudio') 
    }

    dispose() {
        this.model.visible = false
        this.active = false
    }
}
