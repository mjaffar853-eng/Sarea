import * as THREE from 'three';
import Experience from '../Experience.js';

export default class City {
    constructor() {
        this.experience = new Experience();
        this.scene = this.experience.scene;
        this.resources = this.experience.resources;
        this.eventEmitter = this.experience.eventEmitter;
        this.time = this.experience.time;
        this.debug = this.experience.debug;

        this.cityPool = [];
        this.activeCities = [];
        this.segmentCount = 5;
        this.segmentSpacing = 24;

        // Debug folder
        if (this.debug?.active) {
            this.debugFolder = this.debug.ui.addFolder('city');
        }

        this.baseCityModel = this.prepareModel(this.resources.items.cityModel.scene);
        this.initPool(this.segmentCount);
        this.initActiveCities(this.segmentCount);
    }

    prepareModel(originalScene) {
        const model = originalScene.clone();
        model.scale.set(0.2, 0.2, 0.2);

        model.traverse((child) => {
            if (child.name === 'Road') {
                if (child.material.map) {
                    child.material.map.magFilter = THREE.LinearFilter;
                    child.material.map.minFilter = THREE.LinearMipmapLinearFilter;
                    child.material.map.generateMipmaps = true;
                    const maxAnisotropy = this.experience.renderer.instance.capabilities.getMaxAnisotropy();
                    child.material.map.anisotropy = maxAnisotropy;
                }
            }

            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return model;
    }

    cloneCity() {
        return this.baseCityModel.clone(true);
    }

    initPool(count) {
        for (let i = 0; i < count; i++) {
            const city = this.cloneCity();
            this.cityPool.push(city);
        }
    }

    initActiveCities(count) {
        for (let i = 0; i < count; i++) {
            this.spawnCityModel(i);
        }
    }

    spawnCityModel(index = null) {
        let city;

        if (this.cityPool.length > 0) {
            city = this.cityPool.pop();
        } else {
            city = this.cloneCity();
        }

        const zPos = index !== null
            ? -index * this.segmentSpacing
            : this.getNextZ();

        city.position.set(-1.5, 0, zPos);

        const random = Math.random();
        city.rotation.y = random < 0.5 ? 0 : Math.PI;

        if (city.rotation.y === Math.PI) {
            city.position.x += 3;
        }

        this.scene.add(city);
        this.activeCities.push(city);
    }

    getNextZ() {
        if (this.activeCities.length === 0) return 0;
        const last = this.activeCities[this.activeCities.length - 1];
        return last.position.z - this.segmentSpacing;
    }

    recycleSegments() {
        const carZ = this.experience.world.car.model.position.z;
        for (let i = 0; i < this.activeCities.length; i++) {
            const city = this.activeCities[i];
            if (carZ - city.position.z < -this.segmentSpacing) {
                this.scene.remove(city);
                this.cityPool.push(city);
                this.activeCities.splice(i, 1);
                i--;
                this.spawnCityModel();
            }
        }
    }

    update() {
        this.recycleSegments();
    }
}
