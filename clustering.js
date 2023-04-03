const RADIUS = 7;
const CLUSTERCOUNT = 3;
const COLORS = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#D7DF01",
 "#FF00FF", "#00FFFF", "#00FFFF", "#8A4B08", "#F5A9E1", "#A4A4A4"]
// 0 - black, 1 - red, 2 - green, 3 - blue, 4 - yellow,
// 5 - violet, 6 - cyan, 7 - brown, 8 - pink, 9 - grey

class Point {
    constructor(x, y, cluster) {
        this.x  = x;
        this.y = y;
        this.cluster = cluster;
    }
}


function makeRandomPoint(canvas) {
    const rect = canvas.getBoundingClientRect()
    let x = Math.floor(Math.random() * canvas.width);
    let y = Math.floor(Math.random() * canvas.height);
    return new Point(x, y, 0);
}

function getMousePos(canvas, e) {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    return {x: x, y: y};
}


function addPoint(points, canvas, e) {
    let { x, y } = getMousePos(canvas, e);
    let cluster = Math.floor(Math.random() * 9);
    points.push(new Point(x, y, cluster));
    return points;
}


function addRandomPoints(points, canvas, ammount) {
    for (let i = 0; i < ammount; i++) {
        points.push(makeRandomPoint(canvas));
    }
    return points;
}

function drawPoint(ctx, point) {
    ctx.fillStyle = COLORS[point.cluster];
    ctx.fillRect(point.x - RADIUS/2, point.y - RADIUS/2, RADIUS, RADIUS);
}


function update(canvas, ctx, points, e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points = addPoint(points, canvas, e);
    //points = addRandomPoints(points, canvas, 10);
    for (let indx in points) {
        drawPoint(ctx, points[indx]);
    }
}


function main() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    let points = new Array;
    canvas.addEventListener('mousedown', function(e) {
        update(canvas, ctx, points, e);
    });

}

main();