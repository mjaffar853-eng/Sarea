import GameConfig from "../../../static/Configs/GameConfig"
import Experience from "../Experience"
import Events from "../../../static/Configs/Events.js"

const TYPES = {
    SOFTWARE_BOOST: "softwareBoost",
    SPOILER: "spoiler",
    RIM_PROTECTOR: "rimProtector",
    SHADES: "shades",
    JACKPADS: "jackpads",
    CARPLAY: "carplay",
    WHEELCAP: "wheelcap",
}

export default class ValueMeterUI {
    constructor() {
        this.experience = new Experience()
        this.eventEmitter = this.experience.eventEmitter

        this.maxValue = 50
        this.current = 50

        this.getUIElements()
        this.hide()

        this.eventEmitter.on(Events.RimProtectorPickup, () => {
            this.show()
            this.image.src = '/textures/Images/rim-protector-icon.png'
            this.setValue(this.maxValue)
        })
        this.eventEmitter.on(Events.RimProtectorDamage, (value) => {
            this.setValue(value)
        })

        this.eventEmitter.on(Events.GameOver, () => this.hide())
        this.eventEmitter.on(Events.GoHome, () => this.hide())
    }

    getUIElements() {
        this.ui = document.querySelector('.timer-ui')
        this.ring = this.ui.querySelector('#ring')
        this.image = this.ui.querySelector('#timerIcon')
    }

    setMaxValue(v) {
        this.maxValue = Math.max(1, v)
        this._updateVisual()
    }

    setValue(v) {
        this.current = Math.max(0, Math.min(this.maxValue, v))
        this._updateVisual()

        if (this.current <= 0) {
            this.eventEmitter.trigger(Events.RareItemTimerEnd)
            this.hide()
        }
    }

    show() {
        if (!this.ui) return
        this.ui.style.display = "block"
    }

    hide() {
        if (!this.ui) return
        this.ui.style.display = "none"
    }

    _updateVisual() {
        if (!this.ring) return
        const pct = this.current / this.maxValue
        const angle = pct * 360

        this.ring.style.transform = "rotate(0deg)"
        this.ring.style.background =
            `conic-gradient(transparent ${angle}deg, #418BF8 ${angle}deg)`
    }
}
