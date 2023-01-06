import * as THREE from 'three';
import './style.css'
import { AnimationMixer, Group } from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

const scene = new THREE.Scene() // 场景
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000) // 透视摄像机
camera.position.set(0.0, 0.4, 1.0); // 设置相机的位置
const renderer = new THREE.WebGLRenderer({ antialias: true }) // 渲染器
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement) // 放到页面里

const directionLight = new THREE.DirectionalLight(0xffffff, 0.4); // 平行光
scene.add(directionLight);

let mixer: AnimationMixer;
let donuts: Group
new GLTFLoader().load('../resources/models/donuts.glb', (gltf) => {
  scene.add(gltf.scene);
  donuts = gltf.scene;
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
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// 添加 sky.hdr
new RGBELoader()
  .load('../resources/sky.hdr', function (texture) {
    scene.background = texture;
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.render(scene, camera);
  });

// 渲染场景
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  if (donuts) {
    donuts.rotation.y += 0.01; // 让 donuts 旋转
  }
  if (mixer) {
    mixer.update(0.02); // 推进混合器时间并更新动画
  }
}
animate();