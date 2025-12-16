import * as THREE from "three";
import Experience from "../Experience";

export default class Bubble {
    constructor(radius = 0.25) {
        this.radius = radius;
        this.experience = new Experience();
        this.scene = this.experience.scene;

        this.geometry = new THREE.SphereGeometry(this.radius, 16, 16);
        this.material = new THREE.MeshPhongMaterial({
            color: new THREE.Color('#b5c8f0'),
            transparent: true,
            opacity: 0.2,
            shininess: 100,
        });
    }

    create(x, y, z) {
        const mesh = new THREE.Mesh(this.geometry, this.material);
        mesh.position.set(x, y, z); 
        this.scene.add(mesh);
        return mesh;
    }
}
