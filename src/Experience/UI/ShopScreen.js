import Experience from "../Experience";
import { COUPON_DATA_SHOP } from "../../../static/Configs/CouponsConfig";
import Events from "../../../static/Configs/Events.js";

export default class ShopScreen {
    constructor() {
        this.experience = new Experience();
        this.eventEmitter = this.experience.eventEmitter;
        this.shopScreen = document.querySelector(".shop-screen");
        this.couponData = COUPON_DATA_SHOP
        this.getUIElements()
        this.renderCoupons()
        this.registerEvents()
    }

    getUIElements() {
        this.backBtn = this.shopScreen.querySelector(".shop-back-btn");
        this.couponCardsWrapper = this.shopScreen.querySelector(".coupon-cards-wrapper");
        this.coinsUI = this.shopScreen.querySelector(".coins-ui-shop");

        const templateCard = this.couponCardsWrapper.querySelector(".coupon-card-container");
        this.cardTemplate = templateCard.cloneNode(true);
        templateCard.remove();

        this.cardElements = {
            container: ".coupon-card-container",
            discountText: ".discount-percent-text",
            priceText: ".coupon-price-text",
            buyBtn: ".coupon-buy-btn"
        };

        this.confirmPurchaseScreen = document.querySelector(".confirm-purchase-screen");
        this.cancelBtn = this.confirmPurchaseScreen.querySelector(".cancel-btn");
        this.yesBtn = this.confirmPurchaseScreen.querySelector(".yes-btn");
        this.backBtnConfirm = this.confirmPurchaseScreen.querySelector(".back-btn-confirm-purchase");

        this.couponShowScreen = document.querySelector(".coupon-show-screen");
        this.goBackCouponBtn = this.couponShowScreen.querySelector(".go-back-coupon-btn");
        this.couponCodeText = this.couponShowScreen.querySelector(".coupon-code-text");
        this.discountTextCouponScreen = this.couponShowScreen.querySelector(".discount-percent-text-coupon-screen");
        this.copyCodeBtn = this.couponShowScreen.querySelector(".copy-code-btn");
    }

    registerEvents() {
        this.eventEmitter.on(Events.GoToShop, () => {
            this.show();
            this.updateCoinsDisplay();
            this.updateCouponButtons();
            this.bindBuyButtons();
        });

        this.backBtn.addEventListener("click", () => {
            this.hide();
            this.eventEmitter.trigger(Events.GoHome);
        });

        this.cancelBtn.addEventListener("click", () => {
            this.hideConfirmPurchase();
            this.pendingCoupon = null;
        });

        this.backBtnConfirm.addEventListener("click", () => {
            this.hideConfirmPurchase();
            this.pendingCoupon = null;
        });

        this.yesBtn.addEventListener("click", () => {
            if (!this.pendingCoupon) return;

            const total = Number(sessionStorage.getItem("totalCoins") || 0);
            const updated = total - this.pendingCoupon.coinsRequired;
            sessionStorage.setItem("totalCoins", updated);

            this.updateCoinsDisplay();
            this.updateCouponButtons();

            this.hideConfirmPurchase();

            this.activeCouponToShow = this.pendingCoupon;
            this.showCouponScreen(this.pendingCoupon);

            this.pendingCoupon = null;
        });

        this.goBackCouponBtn.addEventListener("click", () => {
            this.hideCouponShowScreen();
        });

        this.copyCodeBtn.addEventListener("click", () => {
            if (!this.activeCouponToShow) return;

            navigator.clipboard.writeText(this.activeCouponToShow.code);

            const textEl = this.copyCodeBtn.querySelector(".copy-code-btn-text");
            if (!textEl) return;

            textEl.textContent = "COPIED";

            setTimeout(() => {
                textEl.textContent = "COPY CODE";
            }, 3000);
        });
    }

    renderCoupons() {
        Object.values(this.couponData).forEach((data, index) => {
            const card = this.cardTemplate.cloneNode(true);

            const discountText = card.querySelector(this.cardElements.discountText);
            const priceText = card.querySelector(this.cardElements.priceText);

            discountText.textContent = `Save ${data.discount}%`;
            priceText.textContent = data.coinsRequired;

            card.dataset.index = index;

            this.couponCardsWrapper.appendChild(card);
        });
    }

    updateCouponButtons() {
        const totalCoins = Number(sessionStorage.getItem("totalCoins") || 0);

        this.couponCardsWrapper.querySelectorAll(this.cardElements.container).forEach(card => {
            const price = Number(card.querySelector(this.cardElements.priceText).textContent);
            const btn = card.querySelector(this.cardElements.buyBtn);

            if (totalCoins < price) {
                btn.disabled = true;
                btn.classList.add("opacity-40", "cursor-not-allowed");
            } else {
                btn.disabled = false;
                btn.classList.remove("opacity-40", "cursor-not-allowed");
            }
        });
    }

    bindBuyButtons() {
        const buttons = this.couponCardsWrapper.querySelectorAll(this.cardElements.buyBtn);

        buttons.forEach(btn => {
            btn.addEventListener("click", () => {
                if (btn.disabled) return;

                const card = btn.closest(this.cardElements.container);
                const index = Number(card.dataset.index);

                this.pendingCoupon = Object.values(this.couponData)[index];
                this.showConfirmPurchase();
            });
        });
    }

    updateCoinsDisplay() {
        const totalCoins = sessionStorage.getItem("totalCoins") || 0;
        this.coinsUI.querySelector(".coins-text").textContent = totalCoins;
    }

    showConfirmPurchase() {
        this.confirmPurchaseScreen.style.display = "flex";
    }

    hideConfirmPurchase() {
        this.confirmPurchaseScreen.style.display = "none";
    }

    showCouponScreen(coupon) {
        this.couponCodeText.textContent = coupon.code;
        this.discountTextCouponScreen.textContent = `Save ${coupon.discount}%`;
        this.couponShowScreen.style.display = "flex";
    }

    hideCouponShowScreen() {
        this.couponShowScreen.style.display = "none";
    }

    show() {
        this.shopScreen.style.display = "flex";
    }

    hide() {
        this.shopScreen.style.display = "none";
    }
}
