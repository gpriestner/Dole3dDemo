console.log("working . . . ");

const canvas = document.querySelector("canvas");
const view = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    view.translate(canvas.width / 2, canvas.height / 2);
    view.scale(1, -1);

    view.lineWidth = 2;
    view.strokeStyle = "black";
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
    constructor(x, y, z, s = 1) {
        this.scale = s;
        this.position = { x, y, z };
    }
    draw() {
        const points = [];
        for (let i = 0; i < this.model.length; ++i) {
            const wp = this.toWorldPoint(this.model[i]);
            const cp = this.toXyPoint(wp);
            points.push(cp);
        }

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
    moveTo(p) { view.moveTo(p.x, p.y); }
    lineTo(p) { view.lineTo(p.x, p.y); }
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

const cube = new Cube(0, 0, 20, 4);
const gui = new dat.GUI();
gui.add(cube.position, "x", -30, 30);
gui.add(cube.position, "y", -30, 30);
gui.add(cube.position, "z", 5, 250);
function animate() {
    view.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    cube.draw();

    requestAnimationFrame(animate);
}

animate();
