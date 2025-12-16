import * as THREE from 'three'
import Experience from '../../Experience.js'
import GameConfig from '../../../../static/Configs/GameConfig.js'
import Bubble from '../../Utils/Bubble.js'
import Events from '../../../../static/Configs/Events.js'

export default class SlowCharger {
    constructor(position) {
        this.experience = new Experience()
        this.audioManager = this.experience.audioManager
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.resource = this.resources.items.slowChargerModel

        this.position = position
        this.batteryRecoveryAmount = GameConfig.chargerConfig.slowCharger.batteryRecoveryAmount
        this.type = 'slowCharger'
        this.rotationSpeed = 0.03
        this.active = true
        this.yOffset = GameConfig.spawnValues.yOffset + 0.2
        this.setModel()
        this.createBubble()
        this.boundingSphere = new THREE.Sphere(this.bubble.position.clone(), 0.38)
    }

    setModel() {
        this.model = this.resource.scene.clone()
        this.model.scale.set(0.4, 0.4, 0.4)
        this.model.position.copy(this.position)
        this.model.position.y = this.yOffset
        this.scene.add(this.model)
    }

    createBubble() {
        const bubbleClass = new Bubble(0.38)
        this.bubble = bubbleClass.create(this.position.x, this.position.y + 0.55, this.position.z)
    }

    onCollision() {
        this.experience.eventEmitter.trigger(Events.ChargePickup, [{
            chargeAmount: this.batteryRecoveryAmount,
            maxChargeReduction: 0
        }])
        this.playAudio()
        this.model.visible = false
        this.bubble.visible = false
        this.active = false
    }

    update() {
        if (this.active) {
            
        }
    }

    playAudio() {
        this.audioManager.create('slowChargerAudio', {
            buffer: this.resources.items['slowChargerAudio'],
            type: 'global',
            loop: false,
            volume: 0.5,
        })
        this.audioManager.play('slowChargerAudio')
    }
}
