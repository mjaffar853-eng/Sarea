import * as THREE from 'three'
import Experience from '../../Experience.js'
import Bubble from '../../Utils/Bubble.js'
import GameConfig from '../../../../static/Configs/GameConfig.js'
import Events from '../../../../static/Configs/Events.js'

export default class SoftwareBoost {
    constructor(position) {
        this.experience = new Experience()
        this.audioManager = this.experience.audioManager
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.resource = this.resources.items.wrenchModel
        this.position = position
        this.type = 'softwareBoost'
        this.isRare = true
        this.rotationSpeed = 0.03
        this.active = true
        this.yOffset = GameConfig.spawnValues.yOffset + 0.25
        this.setModel()
        this.createBubble()
        this.boundingSphere = new THREE.Sphere(this.bubble.position.clone(), 0.29)
        this.chargeDecreaseRate = GameConfig.softwareBoostConfig.chargeDepletionValue
    }

    setModel() {
        this.model = this.resource.scene.clone()
        this.model.scale.set(0.068, 0.2, 0.068)
        this.model.position.copy(this.position)
        this.model.position.y = this.yOffset
        this.model.rotation.z = Math.PI / 2
        this.model.traverse((child) => {
            if (child.name == 'Object_4') {
                child.material.color.set(new THREE.Color('#ffffff'))
            }
        })
        this.scene.add(this.model)
    }

    createBubble() {
        const bubbleClass = new Bubble(0.29)
        this.bubble = bubbleClass.create(this.position.x, this.position.y + 0.33, this.position.z)
    }

    update() {
        if (this.active) {
            this.model.rotation.y += this.rotationSpeed
        }
    }

    onCollision() {
        this.experience.eventEmitter.trigger(Events.ChargeSavePickup, [this.chargeDecreaseRate, this.type])
        this.playAudio()
        this.model.visible = false
        this.bubble.visible = false
        this.active = false
    }

    playAudio() {
        this.audioManager.create('softwareBoostAudio', {
            buffer: this.resources.items['softwareBoostAudio'],
            type: 'global',
            loop: false,
            volume: 0.5,
        })
        this.audioManager.play('softwareBoostAudio')
    }
}
