export default class ObstacleManager {
    constructor(factory) {
        this.factory = factory
        this.obstacleTypes = Object.keys(factory.types)
        this.spawnType = "obstacle"
    }

    shouldSpawn() { return Math.random() < 0.05 }

    spawnEntity(x, z) {
        const type = this.obstacleTypes[Math.floor(Math.random() * this.obstacleTypes.length)]
        const obstacle = this.factory.create(type)
        obstacle.spawn(x, z)
        return obstacle
    }
}
