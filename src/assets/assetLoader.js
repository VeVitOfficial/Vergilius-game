import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * AssetLoader — načítá GLB modely a PBR textury (Color, Normal, Roughness).
 * Vše se cachuje a poskytuje přes getModel() / getTexture().
 */
export class AssetLoader {
    constructor() {
        this.gltfLoader = new GLTFLoader();
        this.textureLoader = new THREE.TextureLoader();
        this.cache = { models: {}, textures: {}, modelBounds: {} };
    }

    async loadAll(onProgress) {
        const models = {
            insula_1:     'assets/models/houses/insula_1.glb',
            insula_2:     'assets/models/houses/insula_2.glb',
            insula_3:     'assets/models/houses/insula_3.glb',
            insula_4:     'assets/models/houses/insula_4.glb',
            colosseum:    'assets/models/landmarks/colosseum.glb',
            statue_bacchus:   'assets/models/decorations/statues/statue_bacchus.glb',
            statue_woman:     'assets/models/decorations/statues/statue_woman.glb',
            statue_pincio:    'assets/models/decorations/statues/statue_pincio.glb',
            statue_asklepios: 'assets/models/decorations/statues/statue_asklepios.glb',
            fountain:     'assets/models/decorations/fountain_pompeii.glb',
            altar:        'assets/models/decorations/altar.glb',
            villa_pack:   'assets/models/decorations/villa_pack.glb',
            centurion:    'assets/models/npc/centurion.glb',
        };

        const textureFolders = {
            bricks:  'assets/textures/Bricks102_2K-JPG/Bricks102_2K-JPG',
            concrete:'assets/textures/Concrete034_2K-JPG/Concrete034_2K-JPG',
            marble:  'assets/textures/Marble012_2K-JPG/Marble012_2K-JPG',
            paving:  'assets/textures/PavingStones054_2K-JPG/PavingStones054_2K-JPG',
            roofing: 'assets/textures/RoofingTiles014B_2K-JPG/RoofingTiles014B_2K-JPG',
        };

        const total = Object.keys(models).length + Object.keys(textureFolders).length;
        let loaded = 0;

        const modelPromises = Object.entries(models).map(([key, path]) => {
            return new Promise((resolve) => {
                this.gltfLoader.load(path,
                    (gltf) => {
                        this.cache.models[key] = gltf;
                        const bbox = new THREE.Box3().setFromObject(gltf.scene);
                        this.cache.modelBounds[key] = bbox;
                        loaded++;
                        if (onProgress) onProgress(loaded / total);
                        resolve();
                    },
                    undefined,
                    (err) => {
                        console.warn('Model load failed:', path, err);
                        resolve();
                    }
                );
            });
        });

        const texturePromises = Object.entries(textureFolders).map(([key, prefix]) => {
            return new Promise((resolve) => {
                this.loadPBRTexture(prefix, key).then((tex) => {
                    this.cache.textures[key] = tex;
                    loaded++;
                    if (onProgress) onProgress(loaded / total);
                    resolve();
                }).catch((err) => {
                    console.warn('Texture load failed:', key, err);
                    resolve();
                });
            });
        });

        await Promise.all([...modelPromises, ...texturePromises]);
        console.log('Assets loaded:', Object.keys(this.cache.models), Object.keys(this.cache.textures));
    }

    /** Načte Color + NormalGL + Roughness mapy */
    async loadPBRTexture(prefix, name) {
        const load = (suffix) => new Promise((resolve, reject) => {
            this.textureLoader.load(`${prefix}_${suffix}.jpg`, resolve, undefined, reject);
        });

        const [map, normalMap, roughnessMap] = await Promise.allSettled([
            load('Color'),
            load('NormalGL'),
            load('Roughness')
        ]);

        const result = {};

        if (map.status === 'fulfilled') {
            const tex = map.value;
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            result.map = tex;
        }
        if (normalMap.status === 'fulfilled') {
            const tex = normalMap.value;
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            result.normalMap = tex;
        }
        if (roughnessMap.status === 'fulfilled') {
            const tex = roughnessMap.value;
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            result.roughnessMap = tex;
        }

        return result;
    }

    getModel(key) {
        const gltf = this.cache.models[key];
        if (!gltf) {
            console.warn('Model not loaded:', key);
            return null;
        }
        const clone = gltf.scene.clone();
        // Ujistíme se, že clone má správné shadow castování
        clone.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return clone;
    }

    getTexture(key) {
        return this.cache.textures[key];
    }

    getModelBounds(key) {
        return this.cache.modelBounds[key];
    }

    createMaterial(key, options = {}) {
        const tex = this.getTexture(key);
        if (!tex || !tex.map) return null;

        const mat = new THREE.MeshStandardMaterial({
            map: tex.map,
            normalMap: tex.normalMap || null,
            roughnessMap: tex.roughnessMap || null,
            roughness: options.roughness ?? 0.9,
            metalness: options.metalness ?? 0.0,
            side: options.side ?? THREE.FrontSide,
        });

        if (options.repeat) {
            tex.map.repeat.set(options.repeat[0], options.repeat[1]);
            if (tex.normalMap) tex.normalMap.repeat.set(options.repeat[0], options.repeat[1]);
            if (tex.roughnessMap) tex.roughnessMap.repeat.set(options.repeat[0], options.repeat[1]);
        }

        return mat;
    }
}
