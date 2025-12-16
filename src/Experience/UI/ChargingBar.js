import Experience from "../Experience"
import GameConfig from "../../../static/Configs/GameConfig"
import Events from "../../../static/Configs/Events.js"

export default class ChargingBar {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.time = this.experience.time
        this.eventEmitter = this.experience.eventEmitter

        this.maxCharge = GameConfig.car.maxCharge
        this.currentMaxCharge = GameConfig.car.currentMaxCharge
        this.currentCharge = GameConfig.car.startCharge
        this.originalChargeDecreaseRate = GameConfig.car.chargeDecreaseRate

        this.getUIElements()
        this.registerEvents()
        this.updateChargingBar()
    }

    getUIElements() {
        this.container = document.querySelector('.energy-bar')
        if (!this.container) return

        this.currentChargeLayer = this.container.querySelector('.current-charge')
        this.currentMaxLayer = this.container.querySelector('.current-max')
        this.currentChargeText = this.container.querySelector('.current-charge-text')
        this.currentMaxText = this.container.querySelector('.current-max-text')
        this.currentMaxMask = this.container.querySelector('.current-max-mask')

        this.hudUI = this.container.querySelector('.item-collect-ui-display')
        this.hudLeft = this.container.querySelector('.item-collected-left')
        this.hudRight = this.container.querySelector('.item-collected-right')

        this.hide()
    }

    registerEvents() {
        this.eventEmitter.on(Events.GameStart, () => {
            this.hudUI.style.display = 'none'
            this.show()
        })
        this.eventEmitter.on(Events.GoHome, () => {
            this.hide()
        })
        this.eventEmitter.on(Events.GameOver, () => {
            this.hide()
        })

        this.eventEmitter.on(Events.ChargeSavePickup, (chargeDecreaseRate, type) => {
            this.hudUI.style.display = "flex";

            const oldRate = this.originalChargeDecreaseRate;
            const newRate = chargeDecreaseRate;
            const reduction = ((oldRate - newRate) / oldRate) * 100;

            this.hudLeft.textContent = `Equipped - ${type}`;
            this.hudRight.textContent = `-      ${reduction.toFixed(1)}% efficiency`;
        });


        this.eventEmitter.on(Events.RimProtectorPickup, () => {
            this.hudUI.style.display = "flex";
            this.hudLeft.textContent = "Equipped - Rim Protector";
            this.hudRight.textContent = "- 50 Damage Reduction";
        });

        this.eventEmitter.on(Events.RareItemTimerEnd, () => {
            this.hudUI.style.display = 'none'
        })
    }

    setInitialCharge(maxCharge, currentCharge) {
        this.currentMaxCharge = maxCharge
        this.currentCharge = currentCharge
        this.updateChargingBar()
    }

    show() {
        if (this.container)
            this.container.style.display = 'flex'
    }

    hide() {
        if (this.container)
            this.container.style.display = 'none'
    }

    updateChargingBar() {
        if (!this.container) return

        this.currentChargeLayer.style.width = `${this.currentCharge}%`
        this.currentMaxMask.style.width = `100%`
        this.currentMaxLayer.style.left = `0%`
        this.currentMaxLayer.style.width = `${this.currentMaxCharge}%`

        const chargeVal = Math.round(this.currentCharge)
        const maxVal = Math.round(this.currentMaxCharge)
        const diffVal = Math.round(this.currentMaxCharge - this.currentCharge)

        this.currentChargeText.textContent = `${chargeVal}`
        this.currentMaxText.textContent = `${maxVal}`

        let midPointPercent = this.currentCharge + diffVal / 2
        this.currentMaxText.style.position = "absolute"
        this.currentMaxText.style.left = `${midPointPercent}%`
        this.currentMaxText.style.transform = "translateX(-50%)"
    }

    updateCharge(newCharge) {
        this.currentCharge = Math.max(0, Math.min(this.currentMaxCharge, newCharge))
        this.updateChargingBar()
    }

    decreaseCharge(amount) {
        this.currentCharge = Math.max(0, this.currentCharge - amount)
        this.updateChargingBar()
    }

    increaseCharge(amount) {
        this.currentCharge = Math.min(this.currentMaxCharge, this.currentCharge + amount)
        this.updateChargingBar()
    }

    decreaseMaxCharge(amount) {
        this.currentMaxCharge = Math.max(0, this.currentMaxCharge - amount)
        if (this.currentCharge > this.currentMaxCharge) {
            this.currentCharge = this.currentMaxCharge
        }
        this.updateChargingBar()
    }

    increaseMaxCharge(amount) {
        this.currentMaxCharge = Math.min(this.maxCharge, this.currentMaxCharge + amount)
        this.updateChargingBar()
    }
}
