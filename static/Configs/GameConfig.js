export default {
    types: {
        SPAWN: {
            OBSTACLE: "obstacle",
            COLLECTABLE: "collectable",
        },
        COLLECTABLE: {
            COIN: "coin",
            SLOW_CHARGER: "slowCharger",
            FAST_CHARGER: "fastCharger",
            SOFTWARE_BOOST: "softwareBoost",
            SPOILER: "spoiler",
            RIM_PROTECTOR: "rimProtector",
            SHADES: "shades",
            JACKPADS: "jackpads",
            CARPLAY: "carplay",
            WHEELCAP: "wheelcap",
        },
    },

    laneData: {
        laneCount: 3,
        laneWidth: 0.85,
        laneIndex: 1,
    },

    car: {
        speed: 12.9,
        acceleration: 0.12,
        deacceleration: 5,
        deaccelerationThreshold: 3,
        maxSpeed: 25,
        wheelRadius: 0.2,
        scale: 0.065,
        startCharge: 65,
        currentMaxCharge: 100,
        maxCharge: 100,
        minBatteryHealth: 60,
        chargeDecreaseRate: 3,
    },

    spawnValues: {
        startOffset: 50,
        minSpacing: 10,
        maxSpacing: 12,
        segmentLength: 100,
        visibleDistance: 100,
        cleanupDistance: 2,
        yOffset: 0.1,
    },

    phaseConfig: {
        easy: { duration: 30, totalEntities: 155, obstaclePatternPercentage: 50, collectablePatternPercentage: 50 },
        medium: { duration: 30, totalEntities: 165, obstaclePatternPercentage: 50, collectablePatternPercentage: 50 },
        hard: { duration: Infinity, totalEntities: 170, obstaclePatternPercentage: 50, collectablePatternPercentage: 50 },
    },

    collectableSpawnRates: {
        easy: {
            fastCharger: 32,
            slowCharger: 32,
            softwareBoost: 6,
            spoiler: 6,
            rimProtector: 6,
            shades: 6,
            jackpads: 6,
            carplay: 6,
            wheelcap: 6,
        },

        medium: {
            fastCharger: 32,
            slowCharger: 32,
            softwareBoost: 6,
            spoiler: 6,
            rimProtector: 6,
            shades: 6,
            jackpads: 6,
            carplay: 6,
            wheelcap: 6,
        },

        hard: {
            fastCharger: 32,
            slowCharger: 32,
            softwareBoost: 6,
            spoiler: 6,
            rimProtector: 6,
            shades: 6,
            jackpads: 6,
            carplay: 6,
            wheelcap: 6,
        },
    },

    obstacleConfig: {
        type1: { damage: 30 },
        type2: { damage: 20 },
        type3: { damage: 15 },
        type4: { damage: 20 },
        obstaclePatterns: {
            type2Line: (laneIndex) => [
                { type: "type2", laneIndex: laneIndex },
                { type: "type2", laneIndex: laneIndex },
                { type: "type2", laneIndex: laneIndex },
                { type: "type2", laneIndex: laneIndex },
            ],
            type2LineWithType3: (laneIndex) => [
                { type: "type3", laneIndex: laneIndex },
                { type: "type2", laneIndex: laneIndex },
                { type: "type2", laneIndex: laneIndex },
            ],
            type4Line: (laneIndex) => [
                { type: "type4", laneIndex: laneIndex },
                { type: "type4", laneIndex: laneIndex },
                { type: "type4", laneIndex: laneIndex },
                { type: "type4", laneIndex: laneIndex },
            ],
            type4LineWithType3: (laneIndex) => [
                { type: "type3", laneIndex: laneIndex },
                { type: "type4", laneIndex: laneIndex },
                { type: "type4", laneIndex: laneIndex },
            ],
        },
    },

    chargerConfig: {
        slowCharger: { batteryRecoveryAmount: 10 },
        fastCharger: { batteryRecoveryAmount: 25, batteryDepletionValue: 2 },
    },

    timerConfig: {
        maxTime: 7,
    },

    softwareBoostConfig: {
        chargeDepletionValue: 0,
    },

    carplayConfig: {
        chargeDepletionValue: 1.254,
    },

    jackpadsConfig: {
        chargeDepletionValue: 1.311,
    },

    spoilerConfig: {
        chargeDepletionValue: 1.161,
    },

    shadesConfig: {
        chargeDepletionValue: 0.525,
    },

    wheelcapConfig: {
        chargeDepletionValue: 1.215,
    },

    rimProtectorConfig: {
        rimProtectorMaxDamage: 50,
    },
};
