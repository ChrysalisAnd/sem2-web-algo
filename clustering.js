const RADIUS = 7;

class Point {
    constructor(x, y, cluster) {
        this.x  = x;
        this.y = y;
        this.cluster = cluster;
    }
}

function getMousePos(canvas, e) {
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    console.log("x: " + x + " y: " + y)
    return {x: x, y: y};
}


function addPoint(points, canvas, e) {
    let { x, y } = getMousePos(canvas, e);
    points.push(x, y, 0);
    return points;
}


function drawPoint(ctx, color, point) {
    ctx.fillStyle = color;
    ctx.fillRect(point.x - RADIUS/2, point.y - RADIUS/2, RADIUS, RADIUS);
}


function update(canvas, ctx, points, e) {
    points = addPoint(points, canvas, e);
    for (let point in points) {
        console.log(point.x + " " + point.y);
        drawPoint(ctx, "#000000", point);
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