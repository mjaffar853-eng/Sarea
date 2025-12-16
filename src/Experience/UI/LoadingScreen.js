import Experience from "../Experience";
import Events from "../../../static/Configs/Events";

export default class LoadingScreen {
    constructor() {
        this.experience = new Experience()
        this.eventEmitter = this.experience.eventEmitter
        this.audioManager = this.experience.audioManager
        this.resources = this.experience.resources
        this.loadingScreen = document.querySelector(".loading-screen")
        this.progressArc = null
        this.loadingText = null
        this.percentageText = null
        this.getUIElements()
        this.registerEvents()
    }

    getUIElements() {
        this.progressArc = this.loadingScreen.querySelector(".progress-arc");
        this.loadingText = this.loadingScreen.querySelector(".loading-text");
        this.percentageText = this.loadingScreen.querySelector(".loading-percentage-text");
    }

    show() {
        this.loadingScreen.style.display = "flex";
    }

    hide() {
        this.loadingScreen.style.display = "none";
    }

    registerEvents() {
        this.eventEmitter.on(Events.AssetLoad, (loaded, total) => {
            this.setProgress(loaded, total)
        })
    }

    setProgress(loaded, total) {
        const angle = 292
        if (total === 0) return;
        const percentage = Math.min((loaded / total) * 100, 100);
        const degree = (angle * percentage) / 100;

        this.updateProgressArc(degree);
        this.updateText(percentage);

        if (percentage >= 100) {
            setTimeout(() => {
                this.hide();
                this.eventEmitter.trigger(Events.LoadingCompleted)
                this.onLoadingComplete()
            }, 1000);
        }
    }

    updateProgressArc(degree) {
        if (!this.progressArc) return;
        this.progressArc.style.setProperty("--deg", `${degree}deg`);
    }

    updateText(percentage) {
        if (this.percentageText)
            this.percentageText.textContent = `${Math.floor(percentage)}%`;
    }

    onLoadingComplete() {
        this.audioManager.create('bgMusic', {
            buffer: this.resources.items['bgMusic'],
            type: 'global',
            loop: true,
            volume: 0.3,
        })
        this.audioManager.play('bgMusic')
    }
}
