import * as THREE from 'three'

export default class CollectableManager {
    constructor(factory, car) {
        this.factory = factory
        this.collectableTypes = Object.keys(factory.types)
        this.car = car
        this.spawnType = "collectable"
    }

    spawnEntity(x, z) {
        const type = this.collectableTypes[Math.floor(Math.random() * this.collectableTypes.length)]
        const collectable = this.factory.create(type, new THREE.Vector3(x, 0, z))
        return collectable
    }
}
