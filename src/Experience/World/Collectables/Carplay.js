import * as THREE from 'three'
import Experience from '../../Experience.js'
import Bubble from '../../Utils/Bubble.js'
import GameConfig from '../../../../static/Configs/GameConfig.js'
import Events from '../../../../static/Configs/Events.js'

export default class Carplay {
    constructor(position) {
        this.experience = new Experience()
        this.audioManager = this.experience.audioManager
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.resource = this.resources.items.carplayModel
        this.position = position
        this.type = 'carplay'
        this.isRare = true
        this.rotationSpeed = 0.03
        this.active = true
        this.yOffset = 0.2
        this.setModel()
        this.createBubble()
        this.boundingSphere = new THREE.Sphere(this.bubble.position.clone(), 0.35)
        this.chargeDecreaseRate = GameConfig.carplayConfig.chargeDepletionValue
    }

    setModel() {
        this.model = this.resource.scene.clone()
        this.model.scale.set(4.5, 4.5, 4.5)
        this.model.position.copy(this.position)
        this.model.position.y = this.yOffset
        this.model.castShadow = true
        this.model.receiveShadow = true
        this.scene.add(this.model)
    }

    createBubble() {
        const bubbleClass = new Bubble(0.35)
        this.bubble = bubbleClass.create(
            this.position.x,
            this.position.y + 0.35,
            this.position.z
        )
    }

    onCollision() {
        this.experience.eventEmitter.trigger(Events.ChargeSavePickup, [this.chargeDecreaseRate, this.type])
        this.playAudio()
        this.model.visible = false
        this.bubble.visible = false
        this.active = false
    }

    update() {
        if (this.active) this.model.rotation.y += this.rotationSpeed
    }

    playAudio() {
        this.audioManager.create('slowChargerAudio', {
            buffer: this.experience.resources.items['slowChargerAudio'],
            type: 'global',
            loop: false,
            volume: 0.2,
        })
        this.audioManager.play('slowChargerAudio')
    }
}
