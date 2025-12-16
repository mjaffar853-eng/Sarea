import * as THREE from 'three'
import gsap from 'gsap'
import Experience from '../Experience.js'
import GameConfig from '../../../static/Configs/GameConfig.js'
import UIManager from '../UI/UIManager.js'
import Events from '../../../static/Configs/Events.js'

export default class Car {
    constructor() {
        this.experience = new Experience()
        this.eventEmitter = this.experience.eventEmitter
        this.audioManager = this.experience.audioManager
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.camera = this.experience.camera
        this.time = this.experience.time
        this.resource = this.resources.items.carModel

        this.laneIndex = GameConfig.laneData.laneIndex
        this.laneCount = GameConfig.laneData.laneCount
        this.laneWidth = GameConfig.laneData.laneWidth
        this.speed = GameConfig.car.speed

        this.acceleration = GameConfig.car.acceleration
        this.deacceleration = GameConfig.car.deacceleration
        this.deaccelerationThreshold = GameConfig.car.deaccelerationThreshold
        this.wheelRadius = GameConfig.car.wheelRadius
        this.maxSpeed = GameConfig.car.maxSpeed
        this.charge = GameConfig.car.startCharge
        this.minBatteryHealth = GameConfig.car.minBatteryHealth
        this.currentMaxCharge = GameConfig.car.currentMaxCharge
        this.maxCharge = GameConfig.car.maxCharge
        this.chargeDecreaseRate = GameConfig.car.chargeDecreaseRate
        this.ischargeSaveActive = false
        this.currentChargeSaveTime = 0
        this.chargeSaveTimerMax = GameConfig.timerConfig.maxTime
        this.chargeSaveAmount = 0

        this.isRimProtectorActive = false
        this.rimProtectorMaxDamage = GameConfig.rimProtectorConfig.rimProtectorMaxDamage
        this.currentDamageDealt = 0

        this.isDead = false
        this.isLaneChanging = false
        this.elapsedTime = 0
        this.uiManager = new UIManager()
        this.chargingBar = this.uiManager.chargingBar
        this.chargingBar.setInitialCharge(this.currentMaxCharge, this.charge)
        this.audioManager = this.experience.audioManager
        this.setModel()
        this.registerEvents()
    }

    setModel() {
        this.model = this.resource.scene.clone()
        this.setInitialPosition()
        this.model.scale.set(GameConfig.car.scale, GameConfig.car.scale, GameConfig.car.scale)
        this.model.rotation.y = Math.PI
        this.scene.add(this.model)

        this.wheels = {}
        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
                child.material.shadowSide = THREE.DoubleSide
            }
            if (child instanceof THREE.Group) {
                if (child.name === 'Wheel_Front_L') this.wheels.frontLeft = child
                if (child.name === 'Wheel_Front_R') this.wheels.frontRight = child
                if (child.name === 'Wheel_Rear_L') this.wheels.rearLeft = child
                if (child.name === 'Wheel_Rear_R') this.wheels.rearRight = child
            }
        })
    }

    setInitialPosition() {
        const offset = (this.laneIndex - (this.laneCount - 1) / 2) * this.laneWidth
        this.model.position.set(offset, -0.03, -1.5)
    }

    registerEvents() {
        this.eventEmitter.on(Events.Left + '.car', () => this.moveLeft())
        this.eventEmitter.on(Events.Right + '.car', () => this.moveRight())

        this.eventEmitter.on(Events.ChargePickup + '.car', (eventData) => {
            this.increaseCharge(eventData.chargeAmount)
            if (eventData.maxChargeReduction > 0)
                this.decreaseMaxCharge(eventData.maxChargeReduction)
        })

        this.eventEmitter.on(Events.ObstacleCollision + '.car', (eventData) => {
            if (this.isRimProtectorActive) {
                this.currentDamageDealt += eventData.damage
                const remaining = this.rimProtectorMaxDamage - this.currentDamageDealt
                this.eventEmitter.trigger(Events.RimProtectorDamage, [remaining])

                if (this.currentDamageDealt >= this.rimProtectorMaxDamage) {
                    this.isRimProtectorActive = false
                    this.currentDamageDealt = 0
                }
            }
            else {
                this.decreaseCharge(eventData.damage)
            }
        })

        this.eventEmitter.on(Events.ChargeSavePickup + '.car', (reducedChargeDecreaseRate) => {
            this.reducedChargeDecreaseRate = reducedChargeDecreaseRate * 0.5
            this.ischargeSaveActive = true
            this.currentChargeSaveTime = 0
        })

        this.eventEmitter.on(Events.RimProtectorPickup + '.car', () => {
            this.isRimProtectorActive = true
            this.currentDamageDealt = 0
        })

        this.eventEmitter.on(Events.GameOver + '.car', () => this.gameOver())
    }

    decreaseCharge(amount) {
        this.charge = Math.max(0, this.charge - amount)
        this.chargingBar.updateCharge(this.charge)
        if (this.charge <= 0 && !this.isDead) {
            this.eventEmitter.trigger(Events.GameOver)
        }
    }

    increaseCharge(amount) {
        this.charge = Math.min(this.currentMaxCharge, this.charge + amount)
        this.chargingBar.updateCharge(this.charge)
    }

    decreaseMaxCharge(amount) {
        this.currentMaxCharge = Math.max(0, this.currentMaxCharge - amount);
        if (this.charge > this.currentMaxCharge) this.charge = this.currentMaxCharge;
        this.chargingBar.currentMaxCharge = this.currentMaxCharge;
        this.chargingBar.updateCharge(this.charge);
    }

    increaseMaxCharge(amount) {
        this.currentMaxCharge = Math.min(this.maxCharge, this.currentMaxCharge + amount)
        this.chargingBar.increaseMaxCharge(amount)
    }

    moveLeft() {
        if (this.laneIndex > 0) {
            this.laneIndex--
            this.updatePosition()
        }
    }

    moveRight() {
        if (this.laneIndex < this.laneCount - 1) {
            this.laneIndex++
            this.updatePosition()
        }
    }

    updatePosition() {
        const targetX = (this.laneIndex - (this.laneCount - 1) / 2) * this.laneWidth
        const direction = targetX > this.model.position.x ? 1 : -1

        gsap.killTweensOf(this.model.position)
        gsap.killTweensOf(this.model.rotation)

        gsap.to(this.model.position, { x: targetX, duration: 0.35 })
        gsap.to(this.model.rotation, {
            y: Math.PI - (0.25 * direction),
            duration: 0.2,
            onComplete: () => {
                gsap.to(this.model.rotation, { y: Math.PI, duration: 0.2 })
            }
        })
    }

    gameOver() {
        this.eventEmitter.off(Events.Left + '.car')
        this.eventEmitter.off(Events.Right + '.car')
        this.eventEmitter.off(Events.ChargePickup + '.car')
        this.eventEmitter.off(Events.ObstacleCollision + '.car')
        this.eventEmitter.off(Events.ChargeSavePickup + '.car')
        this.eventEmitter.off(Events.RimProtectorPickup + '.car')
        this.eventEmitter.off(Events.GameOver + '.car')
        this.isDead = true
    }

    dispose() {
        this.eventEmitter.off(Events.Left + '.car')
        this.eventEmitter.off(Events.Right + '.car')
        this.eventEmitter.off(Events.ChargePickup + '.car')
        this.eventEmitter.off(Events.ObstacleCollision + '.car')
        this.eventEmitter.off(Events.ChargeSavePickup + '.car')
        this.eventEmitter.off(Events.RimProtectorPickup + '.car')
        this.eventEmitter.off(Events.GameOver + '.car')
    }

    update() {
        const delta = this.time.delta * 0.001
        this.elapsedTime += delta

        if (this.speed <= this.maxSpeed) {
            this.minSpeed = 2
            if (this.charge <= this.deaccelerationThreshold) {
                if (this.speed - this.deacceleration * delta >= this.minSpeed) {
                    this.speed -= this.deacceleration * delta
                }
            }
            else {
                this.speed += this.acceleration * delta
            }
            if (this.speed > this.maxSpeed) {
                this.speed = this.maxSpeed
            }
        }

        const previousZ = this.model.position.z
        this.model.position.z -= this.speed * delta
        const distanceMoved = previousZ - this.model.position.z

        const rotationAngle = distanceMoved / this.wheelRadius

        for (let wheel of Object.values(this.wheels)) wheel.rotation.x += rotationAngle

        if (this.ischargeSaveActive) {
            this.currentChargeSaveTime += delta
            if (this.currentChargeSaveTime >= this.chargeSaveTimerMax) {
                this.ischargeSaveActive = false
                this.currentChargeSaveTime = 0
            }
            this.chargeDecrease = this.reducedChargeDecreaseRate * delta * (this.speed / this.maxSpeed)
            this.decreaseCharge(this.chargeDecrease)
        }
        else {
            this.chargeDecrease = this.chargeDecreaseRate * delta * (this.speed / this.maxSpeed)
            this.decreaseCharge(this.chargeDecrease)
        }
    }
}

