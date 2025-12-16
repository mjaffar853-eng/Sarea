import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import Events from '../../../static/Configs/Events.js'

export default class Resources {
    constructor(sources, eventEmitter) {
        this.eventEmitter = eventEmitter

        this.sources = sources
        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0

        this.setLoaders()
        this.startLoading()
    }

    setLoaders() {
        this.loaders = {
            gltfLoader: new GLTFLoader(),
            fbxLoader: new FBXLoader(),
            textureLoader: new THREE.TextureLoader(),
            cubeTextureLoader: new THREE.CubeTextureLoader(),
            audioLoader: new THREE.AudioLoader(),
        }
    }

    startLoading() {
        for (const source of this.sources) {
            switch (source.type) {
                case 'gltfModel':
                    this.loaders.gltfLoader.load(source.path, (file) => this.sourceLoaded(source, file))
                    break

                case 'fbxModel':
                    this.loaders.fbxLoader.load(source.path, (file) => this.sourceLoaded(source, file))
                    break

                case 'texture':
                    this.loaders.textureLoader.load(source.path, (file) => this.sourceLoaded(source, file))
                    break

                case 'cubeTexture':
                    this.loaders.cubeTextureLoader.load(source.path, (file) => this.sourceLoaded(source, file))
                    break

                case 'audio':   
                    this.loaders.audioLoader.load(source.path, (buffer) => this.sourceLoaded(source, buffer))
                    break
            }
        }
    }

    sourceLoaded(source, file) {
        this.items[source.name] = file
        this.loaded++

        this.eventEmitter.trigger(Events.AssetLoad, [
            this.loaded,
            this.toLoad,
        ])

        if (this.loaded === this.toLoad) {
            this.eventEmitter.trigger(Events.Ready)
        }
    }
}
