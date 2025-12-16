import * as THREE from "three";
import GameConfig from "../../../../static/Configs/GameConfig";
import Experience from "../../Experience";
import Events from "../../../../static/Configs/Events.js";

const TYPES = GameConfig.types;

export default class SpawnManager {
    constructor(car) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.eventEmitter = this.experience.eventEmitter
        this.car = car;
        this.entities = [];
        this.managers = [];

        const { laneData, spawnValues } = GameConfig;
        this.laneCount = laneData.laneCount;
        this.laneWidth = laneData.laneWidth;

        this.minSpacing = spawnValues.minSpacing;
        this.maxSpacing = spawnValues.maxSpacing;
        this.cleanupDistance = spawnValues.cleanupDistance;
        this.startOffset = spawnValues.startOffset;
        this.nextSpawnZ = -this.startOffset;

        this.startTime = performance.now();
        this.phase = "easy";

        this.obstacleManagers = [];
        this.collectableManagers = [];

        // Track last spawn Z per lane
        this.laneLastZ = new Array(this.laneCount).fill(-Infinity);

        this.segmentEntitiesCount = 0;
        this.segmentSoftwareBoostSpawned = false;

        this.isRareUnlocked = true
        this.isRareActive = false;

        // Obstacle patterns
        this.obstaclePatterns = GameConfig.obstacleConfig.obstaclePatterns;

        // Coin pattern
        this.coinPattern = (laneIndex) => [
            { type: TYPES.COLLECTABLE.COIN, laneIndex },
            { type: TYPES.COLLECTABLE.COIN, laneIndex },
            { type: TYPES.COLLECTABLE.COIN, laneIndex },
        ];

        this.eventEmitter.on(Events.RareItemTimerEnd, () => {
            this.isRareUnlocked = true
        })
        this.eventEmitter.on(Events.ChargeSavePickup, () => {
            this.isRareUnlocked = false
        })
        this.eventEmitter.on(Events.RimProtectorPickup, () => {
            this.isRareUnlocked = false
        })
    }

    registerManager(manager, type) {
        manager.spawnType = type;
        this.managers.push(manager);
        if (type === TYPES.SPAWN.OBSTACLE) this.obstacleManagers.push(manager);
        else if (type === TYPES.SPAWN.COLLECTABLE) this.collectableManagers.push(manager);
    }

    updatePhase() {
        const elapsed = (performance.now() - this.startTime) / 1000;
        const phases = GameConfig.phaseConfig;
        if (elapsed < phases.easy.duration) this.phase = "easy";
        else if (elapsed < phases.medium.duration) this.phase = "medium";
        else this.phase = "hard";
    }

    getPhaseConfig() {
        return GameConfig.phaseConfig[this.phase];
    }

    laneIndexToX(laneIndex) {
        const half = Math.floor(this.laneCount / 2);
        return (laneIndex - half) * this.laneWidth;
    }

    getFreeLaneIndex(baseZ, requiredSpacing = 6) {
        const candidates = [];
        for (let i = 0; i < this.laneCount; i++) {
            if (Math.abs(this.laneLastZ[i] - baseZ) > requiredSpacing) candidates.push(i);
        }
        if (!candidates.length) return null;
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    chooseObstaclePattern() {
        const patternNames = Object.keys(this.obstaclePatterns);
        const randomIndex = Math.floor(Math.random() * patternNames.length);
        return patternNames[randomIndex];
    }

    spawnObstaclePattern(baseZ) {
        if (!this.obstacleManagers.length) return 0;
        const manager = this.obstacleManagers[0];
        const laneIndex = this.getFreeLaneIndex(baseZ);
        if (laneIndex === null) return 0;

        const patternName = this.chooseObstaclePattern();
        const items = this.obstaclePatterns[patternName](laneIndex);
        const spacing = 2.5
        items.forEach((it, i) => {
            const x = this.laneIndexToX(it.laneIndex);
            const zOffset = i * spacing;
            const obstacle = manager.factory.create(it.type);
            obstacle.spawn(x, baseZ - zOffset);
            this.scene.add(obstacle.model);
            this.entities.push(obstacle);
            this.laneLastZ[it.laneIndex] = baseZ - zOffset;
            this.segmentEntitiesCount++;
        });

        return items.length;
    }

    spawnCollectable(baseZ) {
        if (!this.collectableManagers.length) return 0;

        const manager = this.collectableManagers[0];
        const lane = this.getFreeLaneIndex(baseZ);
        if (lane === null) return 0;

        const rates = GameConfig.collectableSpawnRates[this.phase];
        if (!rates) return 0;

        const keyToType = {
            fastCharger: TYPES.COLLECTABLE.FAST_CHARGER,
            slowCharger: TYPES.COLLECTABLE.SLOW_CHARGER,
            softwareBoost: TYPES.COLLECTABLE.SOFTWARE_BOOST,
            spoiler: TYPES.COLLECTABLE.SPOILER,
            shades: TYPES.COLLECTABLE.SHADES,
            jackpads: TYPES.COLLECTABLE.JACKPADS,
            carplay: TYPES.COLLECTABLE.CARPLAY,
            wheelcap: TYPES.COLLECTABLE.WHEELCAP,
            rimProtector: TYPES.COLLECTABLE.RIM_PROTECTOR
        };

        const rareKeys = [
            TYPES.COLLECTABLE.SPOILER,
            TYPES.COLLECTABLE.SHADES,
            TYPES.COLLECTABLE.JACKPADS,
            TYPES.COLLECTABLE.CARPLAY,
            TYPES.COLLECTABLE.WHEELCAP,
            TYPES.COLLECTABLE.SOFTWARE_BOOST,
            TYPES.COLLECTABLE.RIM_PROTECTOR
        ];

        // weighted key pick
        const entries = Object.entries(rates);
        const total = entries.reduce((s, [, w]) => s + (+w || 0), 0);
        if (total === 0) return 0;

        let r = Math.random() * total;
        let chosenKey = null;

        for (const [key, w] of entries) {
            r -= (+w || 0);
            if (r <= 0) {
                chosenKey = key;
                break;
            }
        }

        if (!chosenKey) return 0;

        // rare gating
        if (rareKeys.includes(chosenKey)) {
            if (!this.isRareUnlocked || this.isRareActive) {
                chosenKey = "fastCharger";
            } else {
                chosenKey = rareKeys[Math.floor(Math.random() * rareKeys.length)];
                this.isRareActive = true;
            }
        }

        const type = keyToType[chosenKey];
        if (!type) return 0;

        const x = this.laneIndexToX(lane);
        const collectable = manager.factory.create(type, new THREE.Vector3(x, 0, baseZ));
        if (!collectable) return 0;

        collectable.isRare = rareKeys.includes(chosenKey);

        this.scene.add(collectable.model);
        this.entities.push(collectable);
        this.laneLastZ[lane] = baseZ;

        return 1;
    }

    spawnCoinPattern(baseZ) {
        if (!this.collectableManagers.length) return 0;
        const manager = this.collectableManagers[0];
        const laneIndex = this.getFreeLaneIndex(baseZ);
        if (laneIndex === null) return 0;

        const items = this.coinPattern(laneIndex);
        items.forEach((it, i) => {
            const x = this.laneIndexToX(it.laneIndex);
            const z = baseZ - i * 1.5;
            const collectable = manager.factory.create(it.type, new THREE.Vector3(x, 0, z));
            this.scene.add(collectable.model);
            this.entities.push(collectable);
            this.segmentEntitiesCount++;
            this.laneLastZ[it.laneIndex] = z;
        });
        return items.length;
    }

    update(delta) {
        this.updatePhase();
        const carZ = this.car.model.position.z;
        const visibleDistance = GameConfig.spawnValues.visibleDistance;
        const phaseConfig = this.getPhaseConfig();
        const totalPatternPercentage = phaseConfig.obstaclePatternPercentage + phaseConfig.collectablePatternPercentage;
        const obstacleChance = phaseConfig.obstaclePatternPercentage / totalPatternPercentage;
        const collectablePatternChance = phaseConfig.collectablePatternPercentage / totalPatternPercentage;

        while (this.nextSpawnZ > carZ - visibleDistance) {
            const r = Math.random();

            if (r < obstacleChance) {
                // 50
                this.spawnObstaclePattern(this.nextSpawnZ);
            }
            else if (r < obstacleChance + collectablePatternChance * 0.7) {
                // 85 - 50 = 35
                this.spawnCoinPattern(this.nextSpawnZ);
            }
            else {
                // 15
                this.spawnCollectable(this.nextSpawnZ);
            }
            this.nextSpawnZ -= this.minSpacing + Math.random() * (this.maxSpacing - this.minSpacing);
        }

        const carBB = new THREE.Box3().setFromObject(this.car.model);
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const e = this.entities[i];
            e.update?.(delta);

            let collided = false;
            if (e.boundingSphere) collided = carBB.intersectsSphere(e.boundingSphere);
            else if (e.boundingBox) collided = carBB.intersectsBox(e.boundingBox);

            if (collided) {
                e.onCollect?.(this.car);
                e.onCollision?.(this.car);
                if (e.isRare != undefined) {
                    if (e.isRare) this.isRareActive = false;
                }
                this.scene.remove(e.model);
                if (e.bubble) this.scene.remove(e.bubble);
                this.entities.splice(i, 1);
                continue;
            }

            if (e.model.position.z > carZ + this.cleanupDistance) {

                this.scene.remove(e.model);
                if (e.isRare != undefined) {
                    if (e.isRare) this.isRareActive = false;
                }
                if (e.bubble) this.scene.remove(e.bubble);
                this.entities.splice(i, 1);
            }
        }
    }
}
