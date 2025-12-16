import Experience from "../Experience"
import Events from "../../../static/Configs/Events.js"

export default class StartCountdown {
    constructor() {
        this.experience = new Experience()
        this.time = this.experience.time
        this.eventEmitter = this.experience.eventEmitter

        this.duration = 4 
        this.elapsed = 0
        this.running = false

        this.createHTML()
        this.hide()

        this.eventEmitter.on(Events.GameStart, () => {
            this.start()
        })
    }

    createHTML() {
        this.container = document.createElement("div")
        this.container.id = "startCountdownContainer"

        this.text = document.createElement("div")
        this.text.className = "countdown-text"
        this.container.appendChild(this.text)

        document.body.appendChild(this.container)
    }

    start() {
        this.elapsed = 0
        this.running = true
        this.show()
        this.updateText(3)
    }

    update() {
        if (!this.running) return

        this.elapsed += this.time.delta / 1000
        const t = Math.floor(this.elapsed)
        
        if (t < 1) this.updateText(3)
        else if (t < 2) this.updateText(2)
        else if (t < 3) this.updateText(1)
        else if (t < 4) this.updateText("Go!")
        else this.stop()
    }

    updateText(value) {
        this.text.textContent = value
        this.text.style.opacity = "1"
        this.text.style.transform = "scale(1)"
        this.text.style.transition = "none"

        requestAnimationFrame(() => {
            this.text.style.transition = "opacity 0.4s ease, transform 0.4s ease"
            this.text.style.opacity = "0"
            this.text.style.transform = "scale(0.5)"
        })
    }

    stop() {
        this.running = false
        this.hide()
        this.eventEmitter.trigger(Events.CountdownComplete)
    }

    show() {
        this.container.style.display = "flex"
    }

    hide() {
        this.container.style.display = "none"
        this.container.style.zIndex = "0"
    }
}
