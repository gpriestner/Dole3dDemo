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
    view.strokeStyle = "black";
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
class Face {
    i = [];
    constructor() { for (const i of arguments) { this.i.push(i); } }
    draw(wPoints, xYpoints) {
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
            view.beginPath();
            this.moveTo(faceXyPoints[0]);
            this.lineTo(faceXyPoints[1]);
            this.lineTo(faceXyPoints[2]);
            this.lineTo(faceXyPoints[3]);
            this.lineTo(faceXyPoints[0]);
            view.stroke();
        }
    }
    moveTo(p) { view.moveTo(p.x, p.y); }
    lineTo(p) { view.lineTo(p.x, p.y); }
}
class Cube {
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
    }
    draw() {
        const points = [], xYpoints = [], wPoints = [];
        for (let i = 0; i < this.model.length; ++i) {
            //const lp = this.toLocalPoint(this.model[i]);
            const wp = this.toWorldPoint(this.model[i]);
            const cp = this.toXyPoint(wp);
            wPoints.push(wp);
            xYpoints.push(cp);
            points.push(cp);
        }

        //for (const f of this.faces) f.draw(wPoints, xYpoints);

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
    moveTo(p) { view.moveTo(p.x, p.y); }
    lineTo(p) { view.lineTo(p.x, p.y); }
    toLocalPoint(p) {
        const rx = this.rotate(p, this.rotation, "x");
        const ry = this.rotate(rx, this.rotation, "y");
        const rz = this.rotate(ry, this.rotation, "z");
        return rz;
    }
    toWorldPoint(p) {
        const wp = { x: this.position.x + p.x * this.scale,
                     y: this.position.y + p.y * this.scale,
                     z: this.position.z + p.z * this.scale
         };
        return wp;
    }
    toXyPoint(p) {
        const xyp = p.z > 0 ? { x: p.x / p.z * canvas.height, y: p.y / p.z * canvas.height } : null;
        return xyp;
    }
}

const cube = new Cube(0, 0, 20, 2);
const gui = new dat.GUI();
gui.add(cube, "scale", 0.5, 10);
gui.add(cube.position, "x", -30, 30);
gui.add(cube.position, "y", -30, 30);
gui.add(cube.position, "z", 5, 250);
function animate() {
    view.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    //cube.rotation.z += 0.01;
    cube.draw();

    requestAnimationFrame(animate);
}

animate();
