import Experience from "../Experience";
import Events from "../../../static/Configs/Events.js";

export default class CoinsCollectScreen {
    constructor(coinCounterUI) {
        this.experience = new Experience()
        this.eventEmitter = this.experience.eventEmitter
        this.coinCounterUI = coinCounterUI
        this.coinsScreen = document.querySelector(".coins-collect-screen")
        this.homeButton = null
        this.playAgainButton = null
        this.pauseButton = null
        this.totalCoins = 0
        this.coinsText = null

        this.getUIElements()
        this.registerEvents()
    }

    getUIElements() {
        if (!this.coinsScreen) return;

        this.homeButton = this.coinsScreen.querySelector(".home-btn-coins");
        this.playAgainButton = this.coinsScreen.querySelector(".play-again-btn-coins");
        this.pauseButton = document.querySelector(".pause-btn-gameplay");
        this.coinsText = this.coinsScreen.querySelector(".coin-middle-lower-coin-text");
        this.cartButton = this.coinsScreen.querySelector(".cart-btn-coins-collect")
        this.decisionScreen = document.querySelector(".shop-play-decision-screen");
        this.shopBtnDecision = this.decisionScreen.querySelector(".shop-btn-decision");
        this.playBtnDecision = this.decisionScreen.querySelector(".play-btn-decision");

        this.confirmPopupScreen = document.querySelector(".confirm-popup-screen");
    }

    show() {
        if (this.coinsScreen) {
            this.coinsScreen.style.display = "flex"
        }
    }

    hide() {
        if (this.coinsScreen)
            this.coinsScreen.style.display = "none"
    }

    setCoins(coins) {
        this.totalCoins = coins
        if (this.coinsText)
            this.coinsText.textContent = this.totalCoins
    }

    registerEvents() {
        this.eventEmitter.on(Events.GameOver, () => {
            this.setCoins(this.coinCounterUI.coins);
            setTimeout(() => {
                this.show();
            }, 600);
        });

        if (this.homeButton) {
            this.homeButton.addEventListener("click", () => {
                this.hide();
                this.eventEmitter.trigger(Events.GoHome);
            });
        }

        if (this.playAgainButton) {
            this.playAgainButton.addEventListener("click", () => {
                this.hide();
                this.showDecisionScreen();
            });
        }

        this.shopBtnDecision.addEventListener("click", () => {
            this.hideDecisionScreen();
            this.eventEmitter.trigger(Events.GoToShop);
        });

        this.playBtnDecision.addEventListener("click", () => {
            this.hideDecisionScreen();
            this.eventEmitter.trigger(Events.GameStart);
        });

        if (this.cartButton) {
            this.cartButton.addEventListener("click", () => {
                this.eventEmitter.trigger(Events.GoToShop);
                this.hide()
            });
        }
    }

    showDecisionScreen() {
        this.decisionScreen.style.display = "flex";
    }

    hideDecisionScreen() {
        this.decisionScreen.style.display = "none";
    }
}
