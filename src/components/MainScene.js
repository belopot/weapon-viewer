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



  constructor(prop) {
    super(prop);

    this.width = 1024;
    this.height = 512;
    //Bind
    this.loadEnvMap = this.loadEnvMap.bind(this);
    this.loadModel = this.loadModel.bind(this);
  }

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

    this.width = this.mainScene.clientWidth;
    this.height = this.mainScene.clientHeight;

    this.timer = 0;

    this.clock = new THREE.Clock();

    //Init scene
    this.loadingManager = new THREE.LoadingManager();
    this.loadingManager.onStart = function (url, itemsLoaded, itemsTotal) {
      // console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
      //Show loading layer
      document.getElementById("loading-container").style.display = "block";
    };

    this.loadingManager.onLoad = function () {
      console.log('Loading complete!');
      //Hide loading Layer
      document.getElementById("loading-container").style.display = "none";
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
    this.scene.background = new THREE.Color(0xeeeeee);

    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.001, 1000);
    this.camera.position.set(-0.5, 0.5, 0.5)

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(this.width, this.height);
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
    this.cameraCtrl.dampingFactor = 0.12;
    this.cameraCtrl.minDistance = 0.1;
    this.cameraCtrl.maxDistance = 10;
    this.cameraCtrl.rotateSpeed = 0.5
    this.cameraCtrl.panSpeed = 0.5;
    // this.cameraCtrl.enablePan = false;
    this.cameraCtrl.target = new THREE.Vector3(0, 0.1, 0);


    this.resizeObserver = new ResizeObserver(entries => {
      //Resize Canvas
      const { width, height } = entries[0].contentRect;
      this.width = width;
      this.height = height;

      if (this.composer)
        this.composer.setSize(this.width, this.height);

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
    });

    this.resizeObserver.observe(this.mainScene);

    //Root object of product
    this.rootObj = new THREE.Object3D();
    this.scene.add(this.rootObj);


    //Lights
    var envLight = new THREE.AmbientLight(0xc4976c, 2.5);
    this.scene.add(envLight);

    var dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(4, 3, 10);
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

    var dirLight1 = new THREE.DirectionalLight(0xffffff, 1);
    dirLight1.position.set(-4, 3, -10);
    dirLight1.castShadow = true;
    dirLight1.shadow.camera.top = 10;
    dirLight1.shadow.camera.bottom = - 10;
    dirLight1.shadow.camera.left = - 10;
    dirLight1.shadow.camera.right = 10;
    dirLight1.shadow.camera.near = 0.1;
    dirLight1.shadow.camera.far = 40;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    this.scene.add(dirLight1);

    //Load envMap
    this.rgbeLoader
      .setDataType(THREE.UnsignedByteType)
      .setPath('assets/textures/env/')
      .load('industry_interior_2.hdr', this.loadEnvMap);


    window.mainScene = this;
  }

  loadEnvMap(texture) {
    var cubeGenerator = new EquirectangularToCubeGenerator(texture, { resolution: 2048 });
    cubeGenerator.update(this.renderer);
    var pmremGenerator = new PMREMGenerator(cubeGenerator.renderTarget.texture);
    pmremGenerator.update(this.renderer);
    var pmremCubeUVPacker = new PMREMCubeUVPacker(pmremGenerator.cubeLods);
    pmremCubeUVPacker.update(this.renderer);
    this.envMap = pmremCubeUVPacker.CubeUVRenderTarget.texture;
    pmremGenerator.dispose();
    pmremCubeUVPacker.dispose();
    // this.scene.background = cubeGenerator.renderTarget;

    this.startScene();
  }

  startScene() {
    //Load default model
    this.loadGLTF("assets/models/akm/scene.gltf");

    this.initPostprocessing();
    this.animate();
  }

  loadGLTF(url) {
    this.gltfLoader.load(url, this.loadModel);
  }

  loadModel(model) {
    this.gun = model.scene.children[0];
    this.gun.scale.set(0.1, 0.1, 0.1);

    //Replace model
    this.scene.remove(this.rootObj);
    this.rootObj = new THREE.Object3D();
    this.scene.add(this.rootObj);
    this.rootObj.add(this.gun);

    let self = this;
    this.scene.traverse(function (child) {
      if (child.isMesh) {
        child.material.envMap = self.envMap;
        child.material.envMapIntensity = 3;
      }
    })

    this.fitCameraToObject(this.gun, 3);
  }

  /**
   * Remove all objects from scene
   */


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

  initPostprocessing() {

    this.composer = new POSTPROCESSING.EffectComposer(this.renderer);

    //Render pass
    const renderPass = new POSTPROCESSING.RenderPass(this.scene, this.camera)
    this.composer.addPass(renderPass);


    // Effect pass
    const vignetteEffect = new POSTPROCESSING.VignetteEffect({
      eskil: false,
      offset: 0.18,
      darkness: 0.7
    });

    const brightnessContrastEffect = new POSTPROCESSING.BrightnessContrastEffect({ contrast: 0.01, brightness: 0.01 });
    const gammaCorrectionEffect = new POSTPROCESSING.GammaCorrectionEffect({ gamma: 1.8 });

    const areaImage = new Image();
    areaImage.src = POSTPROCESSING.SMAAEffect.areaImageDataURL;


    const searchImage = new Image();
    searchImage.src = POSTPROCESSING.SMAAEffect.searchImageDataURL;


    const smaaEffect = new POSTPROCESSING.SMAAEffect(searchImage, areaImage);

    const bloomEffect = new POSTPROCESSING.BloomEffect({
      intensity: 0.2,
      luminanceThreshold: 0.3,
      luminanceSmoothing: 0.83,
      resolutionScale: 0.5,
    });


    const hueSaturationEffect = new POSTPROCESSING.HueSaturationEffect({ hue: 0.0, saturation: -0.391 });

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

    this.updatePostprocessing();
  }

  /**
   * Invalidation handler
   */

  componentDidUpdate(prevProps, prevState, snapshot) {

  }

  /**
   * Dispose
   */
  componentWillUnmount() {
    this.resizeObserver.disconnect();
  }

}
