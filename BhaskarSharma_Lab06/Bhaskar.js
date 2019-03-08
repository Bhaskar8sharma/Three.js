//Author : Bhaskar Sharma   
//Date: 27 Feb 2019
//Lab 06
const renderer = new THREE.WebGLRenderer({ antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / 
    window.innerHeight, 1.0, 1000);

var orbitControls, controls,
    speed = 0.01,
    toRotate = false;


var spoke;
var axle = new THREE.Object3D();
var wheels = [];
var horizontalSupport, verticalSupport;
var basketSupport = [];

//  Custom GUI Controls
var outerRadius = 15;
var innerRadius = 14.5;
var axleRadius = 1;
var rimWidth = 8;
var spokeLength = 30;
var numberOfSpokes = 12;
var rotateWheel = true;
var futuristic = 0;

function init() {

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x004400);

    document.body.appendChild(renderer.domElement);
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
}

function setupCameraAndLight() {
    camera.position.set(-100, 50, 40);
    camera.lookAt(scene.position);
    scene.add(new THREE.AmbientLight(0x666666));
    let directionalLight = new THREE.DirectionalLight(0xeeeeee);
    directionalLight.position.set(20, 60, 10);
    directionalLight.castShadow = true;
    directionalLight.target = scene;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    let hemiSphereLight = new THREE.HemisphereLight(0x7777cc, 0x00ff00, 0.6);//skycolor, groundcolor, intensity  
    hemiSphereLight.position.set(0, 100, 0);
    scene.add(hemiSphereLight);
}

function createGeometry() {

    scene.add(new THREE.AxesHelper(100));
    let plane = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee })
    );
    plane.material.side = THREE.DoubleSide;
    plane.position.set(0, -1, 0);
    plane.rotation.x = -Math.PI * 0.5;
    scene.add(plane);

    let mesh = new THREE.Mesh(
        new THREE.BoxGeometry(10, 10, 10),
        new THREE.MeshLambertMaterial({ color: 0x7777ff })
    );
    mesh.position.set(0, 10, 0);
    mesh.rotation.set(Math.PI * 0.6, 0, Math.PI * 0.3);

    createWheel(0, outerRadius, innerRadius, axleRadius);
    }

function createWheel(position, outerRadius, InnerRadius, axleRadius) {

    return new function () {

        // Creating Axle
        this.axle = new THREE.Mesh(new THREE.CylinderGeometry(axleRadius, axleRadius, rimWidth, 30), new THREE.MeshLambertMaterial({ color: 0x808080 }));
        this.axle.position.set(position, outerRadius + 5, 0);
        this.axle.rotation.z = Math.PI * 0.5;
        this.axle.castShadow = true;
        scene.add(this.axle);

        //  Generating Spokes, Baskets, and Basket Supports
        this.angle = 0;
        for (let i = 0; i < numberOfSpokes; i++) {
            this.spoke = new THREE.Mesh(new THREE.CubeGeometry(spokeLength, 0.5, 0.5, 10), new THREE.MeshLambertMaterial({ color: 0xffffff }));
            this.spoke.position.set(0, -rimWidth / 2 + 1, 0);
            this.spoke.geometry.scale(1, 1, 1);
            this.spoke.rotation.x = Math.PI * 0.5;
            this.spoke.rotation.z = Math.PI * this.angle;
            this.spoke.geometry.translate(0, futuristic, 0);
            this.axle.add(this.spoke);

            this.spoke2 = new THREE.Mesh(new THREE.CubeGeometry(spokeLength, 0.5, 0.5, 20), new THREE.MeshLambertMaterial({ color: 0xffffff }));
            this.spoke2.position.set(0, rimWidth / 2 - 1, 0);
            this.spoke2.geometry.scale(1, 1, 1);
            this.spoke2.rotation.x = Math.PI * 0.5;
            this.spoke2.rotation.z = Math.PI * this.angle;
            this.angle += 1 / (numberOfSpokes / 2);
            this.spoke2.geometry.translate(0, futuristic, 0);
            this.axle.add(this.spoke2);

            this.horizontalSupport = new THREE.Mesh(new THREE.CubeGeometry(0.25, 0.25, rimWidth / 2 + 2, 2),
            new THREE.MeshLambertMaterial({ color: 0xffffff }));
            this.horizontalSupport.position.set(10 * Math.cos(Math.PI * this.angle), 1, 10 * Math.sin(Math.PI * this.angle));
            this.horizontalSupport.rotation.x = Math.PI * 0.5;
            this.horizontalSupport.geometry.translate(0, 0, 1);
            this.axle.add(this.horizontalSupport);
            basketSupport.push(this.horizontalSupport);

            //  ---Vertical Basket Support
            this.verticalSupport = new THREE.Mesh(new THREE.CubeGeometry(0.25, 0.25, 2, 10),
                new THREE.MeshLambertMaterial({ color: 0xffffff }));
            this.verticalSupport.position.set(0, 0, 0);
            this.verticalSupport.rotation.y = Math.PI * 0.5;
            this.verticalSupport.geometry.translate(0, 0, -1);
            this.verticalSupport.castShadow = true;
            this.horizontalSupport.add(this.verticalSupport);

            //  Generating Basket
            this.basket = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 40, 0, Math.PI * 2, 0, Math.PI * 0.8),
                new THREE.MeshLambertMaterial({ color: 0x0000ff, side: THREE.DoubleSide }));
            this.basket.geometry.translate(0, 2, 0);
            this.basket.rotation.z = Math.PI * 0.5;
            this.horizontalSupport.add(this.basket);
        }
        //  Create outer Ring    
        this.extrudeSettings = {
            steps: 2,
            depth: 1,
            bevelEnabled: true,
            bevelThickness: 1,
            bevelSize: 1,
            bevelSegments: 1,
            curveSegments: 32
        };

        this.ring = new THREE.Shape();
        this.ring.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
        this.hole = new THREE.Path();
        this.hole.absarc(0, 0, InnerRadius, 0, Math.PI * 2, true);
        this.ring.holes.push(this.hole);
        this.ring = new THREE.Mesh(new THREE.ExtrudeGeometry(this.ring, this.extrudeSettings), new THREE.MeshLambertMaterial({ color: 	0xD2691E }));
        this.ring.position.set(0, this.extrudeSettings.depth / 2, 0);
        this.ring.rotation.x = Math.PI * 0.5;
        this.axle.add(this.ring);
      
        wheels.push(this);
        this.rotateAxle = function (rotationSpeed) {
            this.axle.rotation.x += rotationSpeed * Math.PI;
            basketSupport.forEach((support) => support.rotation.z -= rotationSpeed * Math.PI);
        }
    }
}

function setupDatGui() {

    controls = new function () {

        this.outerRadius = outerRadius;
        this.innerRadius = innerRadius;
        this.rimWidth = rimWidth;
        this.axleRadius = axleRadius;
        this.spokeLength = spokeLength;
        this.numberOfSpokes = numberOfSpokes;
        this.rotateWheel = rotateWheel;
        this.rotate = toRotate;
        this.refreshWheel = function () {
            scene.remove(wheels.axle);
            basketSupport = [];
            createWheel();
        }
    }

    let gui = new dat.GUI();
    gui.add(controls, 'outerRadius', 0, 25).onChange((c) => outerRadius = c);
    gui.add(controls, 'innerRadius', 0, 20).onChange((c) => innerRadius = c);
    gui.add(controls, 'rimWidth', 0, 20).onChange((c) => rimWidth = c);
    gui.add(controls, 'axleRadius', 0, 5).onChange((c) => axleRadius = c);
    gui.add(controls, 'spokeLength', 0, 45).onChange((c) => spokeLength = c);
    gui.add(controls, 'numberOfSpokes', 5, 20).step(2).onChange((c) => numberOfSpokes = c);
    gui.add(controls, 'rotateWheel').onChange((c) => rotateWheel = c);
    gui.add(controls, 'rotate').onChange((c) => toRotate = c);
    gui.add(controls, 'refreshWheel');
   
}

function render() {

    orbitControls.update();
    if(rotateWheel)
        wheels.forEach((wheel) => wheel.rotateAxle(0.01));
     if (toRotate)
        scene.rotation.y += speed;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

window.onload = () => {
    init();
    setupCameraAndLight();
    createGeometry();
    setupDatGui();
    render();

}
