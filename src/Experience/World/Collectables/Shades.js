import * as THREE from 'three'
import Experience from '../../Experience.js'
import Bubble from '../../Utils/Bubble.js'
import GameConfig from '../../../../static/Configs/GameConfig.js'
import Events from '../../../../static/Configs/Events.js'

export default class Shades {
    constructor(position) {
        this.experience = new Experience()
        this.audioManager = this.experience.audioManager
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.resource = this.resources.items.shadesModel
        this.position = position
        this.type = 'shades'
        this.isRare = true
        this.rotationSpeed = 0.03
        this.active = true
        this.yOffset = 0.6
        this.setModel()
        this.createBubble()
        this.boundingSphere = new THREE.Sphere(this.bubble.position.clone(), 0.35)
        this.chargeDecreaseRate = GameConfig.shadesConfig.chargeDepletionValue
    }

    setModel() {
        this.model = this.resource.scene.clone()
        this.model.scale.set(0.1, 0.1, 0.1)
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
            this.position.y + 0.6,
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
