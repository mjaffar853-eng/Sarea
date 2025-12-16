import Experience from "../Experience"
import Events from "../../../static/Configs/Events.js"

export default class CoinCounterUI {
    constructor() {
        this.experience = new Experience()
        this.eventEmitter = this.experience.eventEmitter
        this.coins = 0
        this.getElements()
        this.registerEvents()
        this.hide()
        this.updateUI()
    }

    registerEvents() {
        this.eventEmitter.on(Events.CoinCollected, () => {
            this.increment()
        })
        this.eventEmitter.on(Events.GameStart, () => {
            this.onStart()
        })
        this.eventEmitter.on(Events.GameOver, () => {
            this.onGameOver()
        })
        this.eventEmitter.on(Events.GoHome, () => {
            this.hide()
        })
    }

    getElements() {
        this.container = document.querySelector(".coins-ui-gameplay")
        this.text = document.querySelector(".coins-text-gameplay")
        this.text.textContent = this.coins
    }

    onStart() {
        this.coins = 0
        this.text.textContent = this.coins
        this.show()
    }

    onGameOver() {
        this.hide()
        this.eventEmitter.trigger(Events.UpdateTotalCoins, [this.coins])
    }

    increment() {
        this.coins++
        this.updateUI()
    }

    updateUI() {
        this.text.textContent = this.coins
    }

    show() {
        if (this.container)
            this.container.style.display = 'flex'
    }

    hide() {
        if (this.container)
            this.container.style.display = 'none'
    }
}
