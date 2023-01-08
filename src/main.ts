import * as THREE from 'three';
import './style.css'
import { AnimationMixer, Group } from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

// const scene = new THREE.Scene() // 场景
// const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 50) // 透视摄像机
// camera.position.set(5, 10, 25); // 设置相机的位置
// const renderer = new THREE.WebGLRenderer({ antialias: true }) // 渲染器
// renderer.setSize(window.innerWidth, window.innerHeight)
// document.body.appendChild(renderer.domElement) // 放到页面里

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 50);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true; // 打开阴影
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.set(5, 10, 25);


scene.background = new THREE.Color(0.2, 0.2, 0.2); // 设置背景

// 灯光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight(0xffffff, 0.2);
scene.add(directionLight);

// directionLight.position.set (10, 10, 10);
directionLight.lookAt(new THREE.Vector3(0, 0, 0));

// 设置阴影
directionLight.castShadow = true;

directionLight.shadow.mapSize.width = 2048;
directionLight.shadow.mapSize.height = 2048;

const shadowDistance = 20;
directionLight.shadow.camera.near = 0.1;
directionLight.shadow.camera.far = 40;
directionLight.shadow.camera.left = -shadowDistance;
directionLight.shadow.camera.right = shadowDistance;
directionLight.shadow.camera.top = shadowDistance;
directionLight.shadow.camera.bottom = -shadowDistance;
directionLight.shadow.bias = -0.001;

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
})

let playerMesh: THREE.Group
let playerMixer: AnimationMixer
let actionWalk: AnimationAction, actionIdle: AnimationAction;
const lookTarget = new THREE.Vector3(0, 2, 0); // 三维向量
new GLTFLoader().load('../resources/models/player.glb', (gltf) => {
  playerMesh = gltf.scene;
  scene.add(gltf.scene);

  playerMesh.traverse((child) => {
    child.receiveShadow = true;
    child.castShadow = true;
  })

  playerMesh.position.set(0, 0, 11.5); // player 的位置
  playerMesh.rotateY(Math.PI); // player 的朝向/旋转

  playerMesh.add(camera);
  camera.position.set(0, 2, -5);
  camera.lookAt(lookTarget);

  // 人物比较暗，让人物亮一点
  const pointLight = new THREE.PointLight(0xffffff, 1.5); // 点光源
  playerMesh.add(pointLight);
  pointLight.position.set(0, 1.8, -1);

  playerMixer = new THREE.AnimationMixer(gltf.scene);

  // 人物行走时候的状态
  const clipWalk = THREE.AnimationUtils.subclip(gltf.animations[0], 'walk', 0, 30);
  actionWalk = playerMixer.clipAction(clipWalk);
  // actionWalk.play();

  // 人物停止时候的状态
  const clipIdle = THREE.AnimationUtils.subclip(gltf.animations[0], 'idle', 31, 281);
  actionIdle = playerMixer.clipAction(clipIdle);
  actionIdle.play();
})

let isWalk = false;
const playerHalfHeight = new THREE.Vector3(0, 0.8, 0);
window.addEventListener('keydown', (e) => {
  if (e.key === 'w') {
    // playerMesh.translateZ(0.1);

    // 碰撞检测
    const curPos = playerMesh.position.clone();
    playerMesh.translateZ(1);
    const frontPos = playerMesh.position.clone();
    playerMesh.translateZ(-1);

    const frontVector3 = frontPos.sub(curPos).normalize()

    const raycasterFront = new THREE.Raycaster(playerMesh.position.clone().add(playerHalfHeight), frontVector3);
    const collisionResultsFrontObjs = raycasterFront.intersectObjects(scene.children);

    if (collisionResultsFrontObjs && collisionResultsFrontObjs[0] && collisionResultsFrontObjs[0].distance > 1) {
      playerMesh.translateZ(0.1);
    }

    if (!isWalk) {
      crossPlay(actionIdle, actionWalk);
      isWalk = true;
    }
  }
  // if (e.key === 's') {
  // playerMesh.translateZ(-0.1);
  // }
})

window.addEventListener('keyup', (e) => {
  if (e.key === 'w') { // 人物停止
    crossPlay(actionWalk, actionIdle);
    isWalk = false;
  }
});

let preClientX: number
window.addEventListener('mousemove', (e) => {

  if (preClientX && playerMesh) {
    playerMesh.rotateY(-(e.clientX - preClientX) * 0.01);
  }
  preClientX = e.clientX;
});


let mixer: AnimationMixer;
let zhanguan: Group
new GLTFLoader().load('../resources/models/zhanguan.glb', (gltf) => {
  scene.add(gltf.scene);
  zhanguan = gltf.scene;

  gltf.scene.traverse((child) => {
    // console.log(child.name);

    child.castShadow = true; // 加阴影
    child.receiveShadow = true; // 加阴影

    if (child.name === '2023') {
      const video = document.createElement('video');
      video.src = "./resources/yanhua.mp4";
      video.muted = true;
      video.autoplay = true
      video.loop = true;
      video.play();

      const videoTexture = new THREE.VideoTexture(video);
      const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

      child.material = videoMaterial;
    }
    if (child.name === '大屏幕01' || child.name === '大屏幕02' || child.name === '操作台屏幕' || child.name === '环形屏幕2') {
      const video = document.createElement('video');
      video.src = "./resources/video01.mp4";
      video.muted = true;
      video.autoplay = true
      video.loop = true;
      video.play();

      const videoTexture = new THREE.VideoTexture(video);
      const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

      child.material = videoMaterial;
    }
    if (child.name === '环形屏幕') {
      const video = document.createElement('video');
      video.src = "./resources/video02.mp4";
      video.muted = true;
      video.autoplay = true
      video.loop = true;
      video.play();

      const videoTexture = new THREE.VideoTexture(video);
      const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

      child.material = videoMaterial;
    }
    if (child.name === '柱子屏幕') {
      const video = document.createElement('video');
      video.src = "./resources/yanhua.mp4";
      video.muted = true;
      video.autoplay = true
      video.loop = true;
      video.play();

      const videoTexture = new THREE.VideoTexture(video);
      const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

      child.material = videoMaterial;
    }
  })

  mixer = new THREE.AnimationMixer(gltf.scene); // 动画混合器
  const clips = gltf.animations; // 播放所有动画
  clips.forEach(function (clip) {
    const action = mixer.clipAction(clip);
    action.loop = THREE.LoopOnce;
    action.clampWhenFinished = true; // 停在最后一帧
    action.play();
  });
})

// 添加轨道控制器
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.update();

// 添加 sky.hdr
// new RGBELoader()
//   .load('../resources/sky.hdr', function (texture) {
//     scene.background = texture;
//     texture.mapping = THREE.EquirectangularReflectionMapping;
//     scene.environment = texture;
//     renderer.outputEncoding = THREE.sRGBEncoding;
//     renderer.render(scene, camera);
//   });

function crossPlay(curAction: AnimationAction, newAction: AnimationAction) {
  curAction.fadeOut(0.3);
  newAction.reset();
  newAction.setEffectiveWeight(1);
  newAction.play();
  newAction.fadeIn(0.3);
}

// 渲染场景
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  if (mixer) {
    mixer.update(0.02); // 推进混合器时间并更新动画
  }
  if (playerMixer) {
    playerMixer.update(0.015);
  }
}
animate();