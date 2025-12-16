import Experience from "../Experience"
import ChargingBar from "./ChargingBar.js"
import CoinsCollectScreen from "./CoinsCollectScreen.js"
import CoinCounterUI from "./CoinsCounterUI.js"
import LoadingScreen from "./LoadingScreen.js"
import PauseScreen from "./PauseScreen.js"
import StartCountdown from "./StartCountdown.js"
import StartScreen from "./StartScreen.js"
import TimerUI from "./TimerUI.js"
import ValueMeterUI from "./ValueMeterUI.js"
import ShopScreen from "./ShopScreen.js"

export default class UIManager {
    static instance = null

    constructor() {
        if (UIManager.instance) 
            return UIManager.instance
        UIManager.instance = this

        this.experience = new Experience()
        this.scene = this.experience.scene
        this.eventEmitter = this.experience.eventEmitter
        this.initUI()
    }

    initUI() {
        this.chargingBar = new ChargingBar()
        this.timerUI = new TimerUI()
        this.valueMeterUI = new ValueMeterUI()
        this.coinCounterUI = new CoinCounterUI()
        this.startCountdown = new StartCountdown()
        this.loadingScreen = new LoadingScreen()
        this.startScreen = new StartScreen()
        this.coinsCollectScreen = new CoinsCollectScreen(this.coinCounterUI)
        this.pauseScreen = new PauseScreen()
        this.shopScreen = new ShopScreen()
    }

    update() {
        if (this.timerUI) this.timerUI.update()
        if (this.startCountdown) this.startCountdown.update()
    }
}
