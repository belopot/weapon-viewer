import React from 'react';
import ResizeObserver from "resize-observer-polyfill";
import './MainScene.scss';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

import { EquirectangularToCubeGenerator } from '../libs/EquirectangularToCubeGenerator';
import { PMREMCubeUVPacker } from '../libs/PMREMCubeUVPacker';
import { PMREMGenerator } from '../libs/PMREMGenerator';

import * as POSTPROCESSING from 'postprocessing';


export default class MainScene extends React.Component {

  state = {
    width: 512,
    height: 512,
  };

  /**
   * Rendering
   */
  render() {
    return (
      <div className='mainScene' ref={(el) => { this.mainScene = el }}></div>
    );
  }

  /**
   * Initialization
   */
  componentDidMount() {

    let self = this;

    this.timer = 0;

    this.clock = new THREE.Clock();


    //Init scene
    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {

      // console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');

    };

    this.loadingManager.onLoad = function () {

      console.log('Loading complete!');

      if (self.gun) {

        self.scene.remove(self.rootObj);

        self.rootObj = new THREE.Object3D();
        self.scene.add(self.rootObj);

        self.rootObj.add(self.gun);


        self.scene.traverse(function (child) {
          if (child.isMesh) {
            child.material.envMap = self.envMap;
            child.material.envMapIntensity = 3;
          }
        })
      }

    };


    this.loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {

      // console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');

    };

    this.loadingManager.onError = function (url) {

      // console.log('There was an error loading ' + url);

    };

    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager);
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.rgbeLoader = new RGBELoader(this.loadingManager);


    /**
     * Set environment
     */

    this.scene = new THREE.Scene();
    self.scene.background = new THREE.Color(0xeeeeee);


    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.001, 1000);
    this.camera.position.set(-0.5, 0.5, 0.5)


    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.autoClear = false;
    this.renderer.gammaOutput = true;
    this.renderer.gammaFactor = 3.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.mainScene.appendChild(this.renderer.domElement);


    this.cameraCtrl = new OrbitControls(this.camera, this.renderer.domElement);
    this.cameraCtrl.enableDamping = true;
    this.cameraCtrl.screenSpacePanning = true;
    this.cameraCtrl.dampingFactor = 0.06;
    this.cameraCtrl.minDistance = 0.1;
    this.cameraCtrl.maxDistance = 10;
    this.cameraCtrl.rotateSpeed = 0.5
    this.cameraCtrl.panSpeed = 0.5;
    // this.cameraCtrl.enablePan = false;
    this.cameraCtrl.target = new THREE.Vector3(0, 0.1, 0);


    this.resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      this.setState({
        width: Math.floor(width),
        height: Math.floor(height)
      });
    });

    this.resizeObserver.observe(this.mainScene);

    //Root object of product
    this.rootObj = new THREE.Object3D();
    this.scene.add(this.rootObj);


    //Light
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    var light = new THREE.AmbientLight(0xffffff, 1.5); // soft white light
    this.scene.add(light);

    var dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(1, 10, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = - 10;
    dirLight.shadow.camera.left = - 10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);

    //Load envMap
    this.rgbeLoader
      .setDataType(THREE.UnsignedByteType)
      .setPath('assets/textures/env/')
      .load('023_hdrmaps_com_free.hdr', function (texture) {
        var cubeGenerator = new EquirectangularToCubeGenerator(texture, { resolution: 2048 });
        cubeGenerator.update(self.renderer);
        var pmremGenerator = new PMREMGenerator(cubeGenerator.renderTarget.texture);
        pmremGenerator.update(self.renderer);
        var pmremCubeUVPacker = new PMREMCubeUVPacker(pmremGenerator.cubeLods);
        pmremCubeUVPacker.update(self.renderer);
        self.envMap = pmremCubeUVPacker.CubeUVRenderTarget.texture;
        pmremGenerator.dispose();
        pmremCubeUVPacker.dispose();
        // self.scene.background = cubeGenerator.renderTarget;
      });

    this.initPostprocessing();

    this.loadTable(0);

    this.animate();


    // /**
    //  * Load assets
    //  */


    window.mainScene = this;
  }

  loadGLTF(url) {
    var self = this;
    this.gltfLoader.load(url, function (model) {
      self.gun = model.scene.children[0].children[0].children[0].children[0];
      self.gun.scale.set(0.1, 0.1, 0.1);
      self.fitCameraToObject(self.gun, 3);
    });
  }


  /**
   * Remove all objects from scene
   */

  loadTable(id) {
    var url = "";
    if (id === 0) {
      url = 'assets/models/akm/scene.gltf';
    }
    else {
      url = 'assets/models/fal/scene.gltf';
    }
    this.loadGLTF(url);
  }

  fitCameraToObject(object, offset) {

    offset = offset || 1.25;

    const boundingBox = new THREE.Box3();

    // get bounding box of object - this will be used to setup controls and camera
    boundingBox.setFromObject(object);

    const center = new THREE.Vector3();

    boundingBox.getCenter(center);

    const size = new THREE.Vector3();
    boundingBox.getSize(size);

    // get the max side of the bounding box (fits to width OR height as needed )
    const maxDim = Math.max(size.x, size.y, size.z);

    const fov = this.camera.fov * (Math.PI / 180);

    var cameraZ = Math.abs(maxDim / 4);

    cameraZ *= offset; // zoom out a little so that objects don't fill the screen

    this.camera.position.z = cameraZ;

    const minZ = boundingBox.min.z;
    const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;

    this.camera.far = cameraToFarEdge * 3;
    this.camera.updateProjectionMatrix();

    if (this.cameraCtrl) {

      // set camera to rotate around center of loaded object
      this.cameraCtrl.target = center;

      // prevent camera from zooming out far enough to create far plane cutoff
      this.cameraCtrl.maxDistance = cameraToFarEdge * 2;

      this.cameraCtrl.saveState();

    } else {

      this.camera.lookAt(center)

    }
  }

  initPostprocessing = function () {

    this.composer = new POSTPROCESSING.EffectComposer(this.renderer);

    this.composer.addPass(new POSTPROCESSING.RenderPass(this.scene, this.camera));

    const vignetteEffect = new POSTPROCESSING.VignetteEffect({
      eskil: false,
      offset: 0.18,
      darkness: 0.7
    });

    const brightnessContrastEffect = new POSTPROCESSING.BrightnessContrastEffect({ contrast: 0.04, brightness: 0.01 });
    const gammaCorrectionEffect = new POSTPROCESSING.GammaCorrectionEffect({ gamma: 2.2 });

    const areaImage = new Image();
    areaImage.src = POSTPROCESSING.SMAAEffect.areaImageDataURL;


    const searchImage = new Image();
    searchImage.src = POSTPROCESSING.SMAAEffect.searchImageDataURL;


    var smaaEffect = new POSTPROCESSING.SMAAEffect(searchImage, areaImage);

    var bloomEffect = new POSTPROCESSING.BloomEffect({
      intensity: 0.2,
      luminanceThreshold: 0.3,
      luminanceSmoothing: 0.03,
      resolutionScale: 1,
    });


    const hueSaturationEffect = new POSTPROCESSING.HueSaturationEffect({ hue: 0.0, saturation: -0.341 });

    const effectPass = new POSTPROCESSING.EffectPass(
      this.camera,
      bloomEffect,
      smaaEffect,
      vignetteEffect,
      brightnessContrastEffect,
      gammaCorrectionEffect,
      hueSaturationEffect,
    );

    effectPass.renderToScreen = true;
    this.composer.addPass(effectPass);


  }

  updatePostprocessing = function () {
    this.composer.render();
  }

  /**
   * Animation loop
   */

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.timer += this.clock.getDelta();


    this.cameraCtrl.update();

    // this.renderer.render(this.scene, this.camera);
    this.updatePostprocessing();

  }

  /**
   * Invalidation handler
   */

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.renderer.setSize(this.state.width, this.state.height);
    this.camera.aspect = this.state.width / this.state.height;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Dispose
   */
  componentWillUnmount() {
    this.resizeObserver.disconnect();
  }

}
