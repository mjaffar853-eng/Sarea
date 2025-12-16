import Carplay from './Carplay.js'
import Coin from './Coin.js'
import FastCharger from './FastCharger.js'
import Jackpads from './Jackpads.js'
import RimProtector from './RimProtector.js'
import Shades from './Shades.js'
import SlowCharger from './SlowCharger.js'
import SoftwareBoost from './SoftwareBoost.js'
import Spoiler from './Spoiler.js'
import WheelCap from './WheelCap.js'

export default class CollectableFactory {
    constructor() {
        this.types = {
            coin: (position) => new Coin(position),
            slowCharger: (position) => new SlowCharger(position),
            fastCharger: (position) => new FastCharger(position),
            softwareBoost: (position) => new SoftwareBoost(position),
            spoiler: (position) => new Spoiler(position),
            rimProtector: (position) => new RimProtector(position),
            shades: (position) => new Shades(position),
            jackpads: (position) => new Jackpads(position),
            carplay: (position) => new Carplay(position),
            wheelcap: (position) => new WheelCap(position),
        }
    }

    create(type, position) {
        if (!this.types[type]) {
            return this.createFallback(position)
        }
        return this.types[type](position)
    }

    createFallback(position) {
        console.warn("Creating fallback collectable.")
        return new SlowCharger(position)
    }
}
