import * as THREE from 'three'
import Experience from '../../Experience.js'
import Bubble from '../../Utils/Bubble.js'
import GameConfig from '../../../../static/Configs/GameConfig.js'
import Events from '../../../../static/Configs/Events.js'

export default class RimProtector {
    constructor(position) {
        this.experience = new Experience()
        this.audioManager = this.experience.audioManager
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.resource = this.resources.items.rimProtectorModel
        this.position = position
        this.type = 'rimProtector'
        this.rotationSpeed = 0.03
        this.active = true
        this.yOffset = 0.3
        this.isRare = true
        
        this.setModel()
        this.createBubble()
        this.boundingSphere = new THREE.Sphere(this.bubble.position.clone(), 0.35)
    }

    setModel() {
        this.model = this.resource.scene.clone()
        this.model.scale.set(2.3, 2.3, 2.3)
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
            this.position.y + 0.45,
            this.position.z
        )
    }

    onCollision() {
        this.experience.eventEmitter.trigger(Events.RimProtectorPickup)
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
