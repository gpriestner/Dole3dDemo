console.log("working . . . ");

const canvas = document.querySelector("canvas");
const view = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    view.lineJoin = "round";
    view.translate(canvas.width / 2, canvas.height / 2);
    view.scale(1, -1);

    view.lineWidth = 4;
    view.lineJoin = "round";
    view.strokeStyle = "black";
}

let wDown = false;
let sDown = false;
document.addEventListener("keydown", e => {
    if (e.code == "KeyW") wDown = true;
    if (e.code == "KeyS") sDown = true;
});

document.addEventListener("keyup", e => {
    if (e.code == "KeyW") wDown = false;
    if (e.code == "KeyS") sDown = false;
});
document.addEventListener("pointerlockchange", lockChange);
canvas.addEventListener("click", async e => {
    if (e.button == 0) {
        if (!document.pointerLockElement) {
            await canvas.requestPointerLock({
            unadjustedMovement: true,
        });
        } else {
            await document.exitPointerLock();
        }
    }
  }
);
function lockChange() {
    if (document.pointerLockElement === canvas) document.addEventListener("mousemove", updatePosition);
    else document.removeEventListener("mousemove", updatePosition);
}
function updatePosition(e) {
    camera.rotation.x -= e.movementY / 1000;
    camera.rotation.y += e.movementX / 1000;
}
function dotProcuct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}
function crossProduct(v1, v2) {
    const cp = { x: v1.y * v2.z - v1.z * v2.y, y: v1.z * v2.x - v1.x * v2.z, z: v1.x * v2.y - v1.y * v2.x };
    const nv = normalizeVector(cp);
    return nv;
}
function normalizeVector(v) {
    const length = Math.sqrt(v.x **2 + v.y ** 2 + v.z **2);
    return { x: v.x / length, y: v.y / length, z: v.z /length };
}
function subtractVector(v1, v2) { // return v1 -> v2
    return { x: v2.x-v1.x, y: v2.y-v1.y, z: v2.z-v1.z };
}


resize();

// view.beginPath();
// view.moveTo(0, 0);
// view.lineTo(100, 100);
// view.stroke();

class Pt {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
class PointLight {
    constructor(x, y, z) {
        this.position = { x, y, z };
        this.color = [255, 255, 255];
    }
}
class Face {
    i = [];
    constructor() { for (const i of arguments) { this.i.push(i); } }
    draw(wPoints, xYpoints, color) {
        const faceWorldPoints = [];
        for (const i of this.i) faceWorldPoints.push(wPoints[i]);
        const faceXyPoints = [];
        for (const i of this.i) faceXyPoints.push(xYpoints[i]);

        // calculate 2 face vectors
        const vectorAB = subtractVector(faceWorldPoints[1], faceWorldPoints[0]);
        const vectorAC = subtractVector(faceWorldPoints[2], faceWorldPoints[0]);

        const normalVector = crossProduct(vectorAB, vectorAC);
        const cameraVector = faceWorldPoints[0];
        const normalizedCameraVector = normalizeVector(cameraVector);
        const dp = dotProcuct(normalVector, normalizedCameraVector);
        const visible = dp < 0;
        
        if(visible) {
            const lightVector = normalizeVector(subtractVector(faceWorldPoints[0], pointLight.position));
            let dpLight = dotProcuct(normalVector, lightVector);
            const ambientLightLevel = 0.35;
            if (dpLight < ambientLightLevel) dpLight = ambientLightLevel;
            let r = color[0] * dpLight * (pointLight.color[0] / 255);
            if (r > 255) r = 255;
            let g = color[1] * dpLight * (pointLight.color[1] / 255);
            if (g > 255) g = 255;
            let b = color[2] * dpLight * (pointLight.color[2] / 255);
            if (b > 255) b = 255;
            view.fillStyle = `rgb(${r},${g},${b})`;
            view.beginPath();
            this.moveTo(faceXyPoints[0]);
            this.lineTo(faceXyPoints[1]);
            this.lineTo(faceXyPoints[2]);
            this.lineTo(faceXyPoints[3]);
            this.lineTo(faceXyPoints[0]);
            view.fill();
            view.stroke();
        }
    }
    moveTo(p) { if(p) view.moveTo(p.x, p.y); }
    lineTo(p) { if(p) view.lineTo(p.x, p.y); }
}
class Cube {
    color = [Math.random() * 255, Math.random() * 255, Math.random() * 255];
    model = [
        new Pt(-1, 1, -1), // top-left front
        new Pt(1, 1, -1), // top-right front
        new Pt(1, -1, -1),  // bottom-right front
        new Pt(-1, -1, -1), // bottom-left front

        new Pt(-1, 1, 1), // top-left back
        new Pt(1, 1, 1), // top-right back
        new Pt(1, -1, 1),  // bottom-right back
        new Pt(-1, -1, 1) // bottom-left back
    ]
    faces = [
        new Face(0,1,2,3), // front
        new Face(5,4,7,6), // back
        new Face(4,5,1,0), // top
        new Face(3,2,6,7), // bottom
        new Face(4,0,3,7), // left
        new Face(1,5,6,2), // right
    ]
    constructor(x, y, z, s = 1) {
        this.scale = s;
        this.position = { x, y, z };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.rdx = Math.random() * 0.06 - 0.03;
        this.rdy = Math.random() * 0.06 - 0.03;
    }
    draw(camera) {
        this.rotation.x += this.rdx;
        this.rotation.y += this.rdy;
        //this.rotation.z += 0.01;

        const xYpoints = [], wPoints = [];
        for (let i = 0; i < this.model.length; ++i) {
            const lp = this.toLocalPoint(this.model[i]);
            const wp = this.toWorldPoint(lp, camera);
            const cp = this.toCameraPoint(wp, camera);
            const xy = this.toXyPoint(cp);
            wPoints.push(wp);
            xYpoints.push(xy);
        }

        for (const f of this.faces) f.draw(wPoints, xYpoints, this.color);
/*
        view.beginPath();
        this.moveTo(points[0]);
        this.lineTo(points[1]);
        this.lineTo(points[2]);
        this.lineTo(points[3]);
        this.lineTo(points[0]);

        this.moveTo(points[4]);
        this.lineTo(points[5]);
        this.lineTo(points[6]);
        this.lineTo(points[7]);
        this.lineTo(points[4]);

        this.moveTo(points[0]);
        this.lineTo(points[4]);
        this.moveTo(points[1]);
        this.lineTo(points[5]);
        this.moveTo(points[2]);
        this.lineTo(points[6]);
        this.moveTo(points[3]);
        this.lineTo(points[7]);

        view.stroke();
*/
    }
    rotate(p, rotation, axis) {
        const angle = rotation[axis];
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        switch(axis) {
            case "x": return { x: p.x, y: p.y * cos - p.z * sin, z: p.y * sin + p.z * cos };
            case "y": return { x: p.x * cos - p.z * sin, y: p.y, z: p.x * sin + p.z * cos };
            case "z": return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos, z: p.z };
        }
    }
    moveTo(p) { if(p) view.moveTo(p.x, p.y); }
    lineTo(p) { if(p) view.lineTo(p.x, p.y); }
    toLocalPoint(p) {
        const rx = this.rotate(p, this.rotation, "x");
        const ry = this.rotate(rx, this.rotation, "y");
        const rz = this.rotate(ry, this.rotation, "z");
        return rz;
    }
    toWorldPoint(p, camera) {
        const wp = { x: (this.position.x - camera.position.x) + p.x * this.scale,
                     y: (this.position.y - camera.position.y) + p.y * this.scale,
                     z: (this.position.z - camera.position.z) + p.z * this.scale
         };
        return wp;
    }
    toCameraPoint(p, camera) {
        const cp = subtractVector(camera.position, p);
        const ry = this.rotate(cp, camera.rotation, "y");
        const rx = this.rotate(ry, camera.rotation, "x");
        return rx;
    }
    toXyPoint(p) {
        const xyp = p.z > 0 ? { x: p.x / p.z * canvas.height, y: p.y / p.z * canvas.height } : null;
        return xyp;
    }
}
class Camera {
    constructor(x, y, z) {
        this.position = { x, y, z };
        this.rotation = { x: 0, y: 0 };
    }
}
class Scene {
    objects = [];
    add(o) { this.objects.push(o); }
    draw(camera) { for(const o of this.objects) o.draw(camera); }
}

const pointLight = new PointLight(10, 10, 0);
const cube = new Cube(0, 0, 20, 2);

const scene = new Scene();
scene.add(cube);

const camera = new Camera(0, 0, 0);

for (let i = 0; i < 100; ++i) scene.add(new Cube(Math.random() * 100 - 50,Math.random() * 100 - 50, Math.random() * 50 + 20, Math.random() * 4));

// #region DatGui
const gui = new dat.GUI();
const cubeFolder = gui.addFolder("Cube");
cubeFolder.add(cube, "scale", 0.5, 10);
cubeFolder.add(cube.position, "x", -30, 30);
cubeFolder.add(cube.position, "y", -30, 30);
cubeFolder.add(cube.position, "z", 5, 250);
cubeFolder.add(cube.rotation, "x", -Math.PI, Math.PI);
cubeFolder.add(cube.rotation, "y", -Math.PI, Math.PI);
cubeFolder.add(cube.rotation, "z", 5, 250);
const lightFolder = gui.addFolder("Light");
lightFolder.add(pointLight.position, "x", -20, 20);
lightFolder.add(pointLight.position, "y", -20, 20);
lightFolder.add(pointLight.position, "z", -20, 20);
lightFolder.addColor(pointLight, "color");

const camFolder = gui.addFolder("Camera");
const positionFolder = camFolder.addFolder("Position");
positionFolder.add(camera.position, "x", -20, 20);
positionFolder.add(camera.position, "y", -20, 20);
positionFolder.add(camera.position, "z", -20, 20).listen();
const rotationFolder = camFolder.addFolder("Rotation");
rotationFolder.add(camera.rotation, "x", -Math.PI, Math.PI);
rotationFolder.add(camera.rotation, "y", -Math.PI, Math.PI);

// #endregion
function animate() {
    view.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    if (wDown) camera.position.z += 0.5;
    if (sDown) camera.position.z -= 0.5;


    scene.draw(camera);

    requestAnimationFrame(animate);
}

animate();
