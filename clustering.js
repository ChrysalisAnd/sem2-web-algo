const RADIUS = 7;
let CLUSTERCOUNT = 7;
const COLORS = ["#000000", "#FF0000", "#00FF00", "#0000FF", "#D7DF01",
 "#FF00FF", "#00FFFF", "#8A4B08", "#F5A9E1", "#A4A4A4"]
// 0 - black, 1 - red, 2 - green, 3 - blue, 4 - yellow,
// 5 - violet, 6 - cyan, 7 - brown, 8 - pink, 9 - grey

class Point {
    constructor(x, y, cluster) {
        this.x  = x;
        this.y = y;
        this.cluster = cluster;
    }
}


function distance(p1, p2) {
    return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
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


function generateCentroids(canvas) {
    let centroids = new Array;
    centroids = addRandomPoints(centroids, canvas, CLUSTERCOUNT);
    for (let i in centroids) {
        centroids[i].cluster = i;
    }
    return centroids;
}


function drawPoint(ctx, point) {
    ctx.fillStyle = COLORS[point.cluster];
    ctx.fillRect(point.x - RADIUS/2, point.y - RADIUS/2, RADIUS, RADIUS);
}


function drawCentroid(ctx, centroid) {
    ctx.fillStyle = COLORS[centroid.cluster];
    ctx.fillRect(centroid.x - RADIUS, centroid.y - RADIUS/4, RADIUS*2, RADIUS/2);
    ctx.fillRect(centroid.x - RADIUS/4, centroid.y - RADIUS, RADIUS/2, RADIUS*2);
}


function kMeansIteration(points, centroids) {
    let totalDistChange = 0;
    let clusters = new Array(CLUSTERCOUNT);
    for (let i = 0; i < CLUSTERCOUNT; i++) {
        clusters[i] = {sumDistX: 0, sumDistY: 0, count: 0};
    }

    for (point in points) {
        let minDist = 10000000;
        let minCluster = -1;
        for (center in centroids) {
            let dist = distance(points[point], centroids[center]);
            if (dist < minDist) {
                minDist = dist;
                minCluster = center;
            }
        }
        points[point].cluster = minCluster;
        clusters[minCluster].count++;
        clusters[minCluster].sumDistX += points[point].x;
        clusters[minCluster].sumDistY += points[point].y;
    }
    for (center in centroids) {
        let oldCentroid = JSON.parse(JSON.stringify(centroids[center])); //deep copy
        if (clusters[center].count != 0) {
            centroids[center].x = clusters[center].sumDistX / clusters[center].count;
            centroids[center].y = clusters[center].sumDistY / clusters[center].count;
            totalDistChange += distance(oldCentroid, centroids[center]);
        }
    }
    return totalDistChange;
}

function kMeans(points, centroids) {
    let distChange = 10000;
    let iterationCount = 0;
    while (distChange > 0.1 * CLUSTERCOUNT) {
        iterationCount++;
        distChange = kMeansIteration(points, centroids);
    }
    //console.log(iterationCount);
}


function update(canvas, ctx, points, centroids, e) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points = addPoint(points, canvas, e);
    //points = addRandomPoints(points, canvas, 10);

    kMeans(points, centroids);


    for (let indx in points) {
        drawPoint(ctx, points[indx]);
    }
    for (let indx in centroids) {
        drawCentroid(ctx, centroids[indx]);
    }
}


function clustering() {
    const canvas = document.getElementById("canvasCluster");
    const ctx = canvas.getContext("2d");
    let points = new Array;
    let centroids = generateCentroids(canvas);
    canvas.addEventListener('mousedown', function(e) {
        update(canvas, ctx, points, centroids, e);
    });

}

function reset() {
    main();
}

function main() {
    clustering();

}

main();