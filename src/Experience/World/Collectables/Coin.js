import * as THREE from 'three'
import Experience from '../../Experience.js'
import GameConfig from '../../../../static/Configs/GameConfig.js'
import Events from '../../../../static/Configs/Events.js'

export default class Coin {
    static coinsCount = 0

    constructor(position) {
        this.experience = new Experience()
        this.audioManager = this.experience.audioManager
        this.scene = this.experience.scene
        this.eventEmitter = this.experience.eventEmitter
        this.resources = this.experience.resources
        this.resource = this.resources.items.coinModel
        this.position = position
        this.type = "coin"
        this.rotationSpeed = 0.03
        this.yOffset = GameConfig.spawnValues.yOffset
        this.setModel()
        this.boundingBox = new THREE.Box3().setFromObject(this.model)
        this.active = true
    }

    setModel() {
        this.model = this.resource.scene.clone()
        this.model.scale.set(0.7, 0.7, 0.7)
        this.model.position.copy(this.position)
        this.model.position.y = this.yOffset
        this.model.castShadow = true
        this.model.receiveShadow = true
    }

    update() {
        if (!this.active) return
        this.model.rotation.y += this.rotationSpeed
        this.boundingBox.setFromObject(this.model)
    }

    onCollision() {
        Coin.coinsCount++
        this.eventEmitter.trigger(Events.CoinCollected)
        this.playAudio()
        this.model.visible = false
        this.active = false
    }

    playAudio() {
        this.audioManager.create('coinCollectAudio', {
            buffer: this.resources.items['coinCollectAudio'],
            type: 'global',
            loop: false,
            volume: 0.5,
        })
        this.audioManager.play('coinCollectAudio')
    }
}
