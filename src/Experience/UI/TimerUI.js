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

export default class TimerUI {
    constructor() {
        this.experience = new Experience()
        this.eventEmitter = this.experience.eventEmitter
        this.time = this.experience.time

        this.duration = GameConfig.timerConfig.maxTime
        this.elapsed = 0
        this.running = false

        this.getUIElements()
        this.hide()

        this.eventEmitter.on(Events.ChargeSavePickup, (chargeDecreaseRate, type) => {
            if (type === TYPES.WHEELCAP) {
                this.image.src = '/textures/Images/wheelcap-icon.png'
            }
            else if (type === TYPES.SPOILER) {
                this.image.src = '/textures/Images/spoiler-icon.png'
            }
            else if (type === TYPES.SHADES) {
                this.image.src = '/textures/Images/shades-icon.png'
            }
            else if (type === TYPES.JACKPADS) {
                this.image.src = '/textures/Images/jackpad-icon.png'
            }
            else if (type === TYPES.CARPLAY) {
                this.image.src = '/textures/Images/carplay-icon.png'
            }
            else if (type === TYPES.SOFTWARE_BOOST) {
                this.image.src = '/textures/Images/wrench-icon.png'
            }
            this.start()
        })

        this.eventEmitter.on(Events.GameOver, () => {
            this.hide()
            this.running = false
        })

        this.eventEmitter.on(Events.GoHome, () => {
            this.hide()
            this.running = false
        })
    }

    getUIElements() {
        this.ui = document.querySelector('.timer-ui')
        this.ring = this.ui.querySelector('#ring')
        this.image = this.ui.querySelector('#timerIcon')
    }

    start() {
        this.elapsed = 0
        this.running = true
        this.show()
        this._updateVisual()
    }

    update() {
        if (!this.running) return
        const dt = (this.time && this.time.delta != null) ? (this.time.delta / 1000) : (1 / 60)
        this.elapsed += dt

        if (this.elapsed >= this.duration) {
            this.elapsed = this.duration
            this.running = false
            this._updateVisual()
            this.hide()
            this.eventEmitter.trigger(Events.RareItemTimerEnd)
            return
        }
        this._updateVisual()
    }

    reset() {
        this.running = false
        this.elapsed = 0
        this._updateVisual()
        this.hide()
    }

    show() {
        if (!this.ui) return
        this.ui.style.display = 'block'
        this.ui.classList.remove && this.ui.classList.remove('hidden')
    }

    hide() {
        if (!this.ui) return
        this.ui.style.display = 'none'
    }

    _updateVisual() {
        if (!this.ring) return

        const pct = Math.max(0, Math.min(1, this.elapsed / this.duration))
        const angle = pct * 360
        this.ring.style.transform = "rotate(0deg)"
        this.ring.style.background =
            `conic-gradient(transparent ${angle}deg, #418BF8 ${angle}deg)`
    }
}
