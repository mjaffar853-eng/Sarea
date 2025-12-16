import * as THREE from 'three'
import Experience from '../../Experience.js'
import GameConfig from '../../../../static/Configs/GameConfig.js'
import Bubble from '../../Utils/Bubble.js'
import Events from '../../../../static/Configs/Events.js'

export default class FastCharger {
    constructor(position) {
        this.experience = new Experience()
        this.audioManager = this.experience.audioManager
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.resource = this.resources.items.fastChargerModel

        this.position = position
        this.batteryRecoveryAmount = GameConfig.chargerConfig.fastCharger.batteryRecoveryAmount
        this.batteryDepletionValue = GameConfig.chargerConfig.fastCharger.batteryDepletionValue
        this.type = 'fastCharger'
        this.rotationSpeed = 0.03
        this.active = true
        this.yOffset = GameConfig.spawnValues.yOffset + 0.3
        this.setModel()
        this.createBubble()
        this.boundingSphere = new THREE.Sphere(this.bubble.position.clone(), 0.35)
    }

    setModel() {
        this.model = this.resource.scene.clone()
        this.model.scale.set(0.02, 0.02, 0.02)
        this.model.position.copy(this.position)
        this.model.position.y = this.yOffset
        this.model.castShadow = true
        this.model.receiveShadow = true
        this.scene.add(this.model)
    }

    createBubble() {
        const bubbleClass = new Bubble(0.35)
        this.bubble = bubbleClass.create(this.position.x, this.position.y + 0.6, this.position.z)
    }

    onCollision() {
        this.experience.eventEmitter.trigger(Events.ChargePickup, [{
            chargeAmount: this.batteryRecoveryAmount,
            maxChargeReduction: this.batteryDepletionValue
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
        this.audioManager.create('fastChargerAudio', {
            buffer: this.resources.items['fastChargerAudio'],
            type: 'global',
            loop: false,
            volume: 0.2,
        })
        this.audioManager.play('fastChargerAudio')
    }
}
