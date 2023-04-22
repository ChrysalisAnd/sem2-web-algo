
const RADIUS = 7;
const POPULATIONSIZE = 20;
const ELITESIZE = 7;
const MUTATIONRATE = 0.05;

let running = false;

let points = [];

class Point {
    constructor(x, y) {
        this.x  = x;
        this.y = y;
    }

    distance = (p) => {
        return Math.sqrt((this.x - p.x) * (this.x - p.x) + (this.y - p.y) * (this.y - p.y));
    };

    isEqual = (p) => {
        return (this.x == p.x) && (this.y == p.y);
    }
}


class Fitness {
    constructor(route) {
        this.route = route;
        this.length = 0;
        this.fitness = 0;
    }

    routeLength = () => {
        if (this.length == 0) {
            let pathLength = 0;
            for (let i = 0; i < this.route.length; i++) {
                let from = this.route[i];
                let to;
                if (i + 1 < this.route.length) {
                    to = this.route[i+1];
                } else {
                    to = this.route[0];
                }
                pathLength += from.distance(to);
            }
            this.length = pathLength;
        }
        return this.length;
    }

    routeFitness = () => {
        if (this.fitness == 0) {
            this.fitness = this.routeLength();
        }
        return this.fitness;
    }
}


class Evolution {
    constructor() {

    }


    population = [];
    fitnessResults = {};
    indxSorted = [];
    bestIndivid = {fitness: 10000000, route: []};

    initialPopulation = () => {
        this.population = [];
        for (let i = 0; i < POPULATIONSIZE; i++) {
            this.population.push(shuffle(points));
        }
        return this.population;
    }

    rankRoutes = () => {
        for (let i = 0; i < POPULATIONSIZE; i++) {
            this.fitnessResults[i] = new Fitness(this.population[i]).routeFitness();
        }
        let indxSorted = Object.keys(this.fitnessResults).sort((a,b) => {return this.fitnessResults[a]-this.fitnessResults[b]})
        this.indxSorted = indxSorted;
        return indxSorted;
    }

    selection = (populationRanked) => {
        //making roulette with fitness-weighted probability of selection
        let selectionResults = [];
        let cumulativeSum = [];
        cumulativeSum.push(this.fitnessResults[populationRanked[0]]);
        for (let i = 1; i < POPULATIONSIZE; i++) {
            cumulativeSum.push(cumulativeSum[i-1] + this.fitnessResults[populationRanked[i]]);
        }
        let fitnessSum = cumulativeSum[POPULATIONSIZE - 1];
        for (let i = 0; i < ELITESIZE; i++) {
            selectionResults.push(populationRanked[i]);
        }
        for (let i = 0; i < POPULATIONSIZE - ELITESIZE; i++) {
            let pick = Math.random() * fitnessSum;
            for (let j = 0; j < POPULATIONSIZE; j++) {
                if (pick <= cumulativeSum[j]) {
                    selectionResults.push(populationRanked[j]);
                    break;
                }
            }
        }
        return selectionResults;
    }

    matingPool = (selectionResults) => {
        let matingpool = [];
        for (let i = 0; i < POPULATIONSIZE; i++) {
            let indx = selectionResults[i];
            matingpool.push(this.population[indx]);
        }
        return matingpool;
    }

    breed = (parent1, parent2) => {
        let child = [];
        let childP1 = [];
        let childP2 = [];
        let genA = Math.floor(Math.random() * parent1.length);
        let genB = Math.floor(Math.random() * parent1.length);
        let startGene = Math.min(genA, genB);
        let endGene = Math.max(genA, genB);
        for (let i = startGene; i < endGene; i++) {
            childP1.push(parent1[i]);
        }
        for (let i = 0; i < parent2.length; i++) {
            //if (!(childP1.some(point => point === parent2[i]))) {
            if (!contains(childP1, parent2[i])) {
                childP2.push(parent2[i]);
            }
        }
        child = childP1.concat(childP2);
        return child;
    }

    breedPopulation = (matingpool) => {
        let children = [];
        for (let i = 0; i < ELITESIZE; i++) {
            children.push(matingpool[i]);
        }

        let pool = [];
        let shuffledPool = shuffle(matingpool);
        let length = matingpool.length - ELITESIZE;
        for (let i = 0; i < length; i++) {
            pool.push(shuffledPool[i]);
        }

        for (let i = 1; i < length; i++) {
            let child = this.breed(pool[i-1], pool[i]);
            children.push(child);
        }
        children.push(this.breed(pool[length - 1], pool[0]));

        return children;
    }

    mutate = (individ) => {

        for (let swapped = 0; swapped < individ.length; swapped++) {
            if (Math.random() < MUTATIONRATE) {
                let swapwith = Math.floor(Math.random() * individ.length);
                let point1 = new Point(individ[swapped].x, individ[swapped].y);
                let point2 = new Point(individ[swapwith].x, individ[swapwith].y);

                [individ[swapped], individ[swapwith]] = [point2, point1];
                //individ.splice(swapwith, 1, point1);
                //individ.splice(swapped, 1, point2);

            }
        }
        return individ;
    }

    mutatePopulation = (pop) => {
        let mutatedPop = [];
        pop.forEach(individ => {
            mutatedPop.push(this.mutate(individ));
        });
        return mutatedPop;
    }

    nextGeneration = () => {
        let indxSorted = evol.rankRoutes();
        let selection = evol.selection(indxSorted);
        let mPool = evol.matingPool(selection);
        let children = evol.breedPopulation(mPool);
        let newPop = evol.mutatePopulation(children);
        return newPop;
    }
}

window.onload = async () => {
    evol = new Evolution();
}

function stopFunc() {
    running = false;
    evolveButton.disabled = false;
    clearButton.disabled = false;
    status.innerHTML += "Algorithm stopped.<br>"
}

function clear() {
    evol = new Evolution();
    points = [];
    status.innerHTML = "Cleared.<br>";
    update();
}

function shuffle(arr) {
    let currentIndex = arr.length, randomIndex;
    //let array = JSON.parse(JSON.stringify(arr));
    let array = [...arr];

    while (currentIndex != 0) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
}

function contains(array, elem) {
    let contain = false;
    for (let i = 0; i < array.length; i++) {
        if (array[i].isEqual(elem)) {
            contain = true;
            break;
        }
    }
    return contain;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function evolve() {
    evolveButton.disabled = true;
    clearButton.disabled = true;
    running = true;
    status.innerHTML += "Starting genetic algorithm... <br>";
    evol = new Evolution();
    evol.initialPopulation();
    let iter = 1;
    //let maxIter = 10000;
    while (running) {
        let pop = evol.nextGeneration();
        let bestRoute = evol.population[evol.indxSorted[0]];
        let bestRouteFit = new Fitness(bestRoute).routeFitness();
        if (bestRouteFit < evol.bestIndivid.fitness) {
            evol.bestIndivid.fitness = bestRouteFit;
            evol.bestIndivid.route = bestRoute;
        }

        if (iter % 1000 == 0) {
            status.innerHTML += "iteration: " + iter + "<br>";
            status.innerHTML += "total best fitness: " + evol.bestIndivid.fitness.toFixed(2) + "<br>";
            status.innerHTML += "best current generation fitness: " + evol.fitnessResults[0].toFixed(2) + "<br><br>";
            //console.log(iter);
            //console.log(evol.bestIndivid.route);
            //console.log(evol.bestIndivid.fitness);
            //console.log(evol.fitnessResults[0]);

            update(bestRoute);
            await sleep(500);
            update(evol.bestIndivid.route);
            await sleep(250);
        }
        evol.population = pop;
        evol.indxSorted = [];
        evol.fitnessResults = {};
        iter++;
    }
    update(evol.bestIndivid.route);

    //console.log(children);
    //console.log(newPop);
}


// drawing

const addPoint = (e) => {
    if (ctx && !running) {
        let x = e.clientX - ctx.canvas.getBoundingClientRect().x;
        let y = e.clientY - ctx.canvas.getBoundingClientRect().y;
        let point = new Point(x, y);
        points.push(point);
        update();
    }
};

function drawPoint(point) {
    ctx.fillRect(point.x - RADIUS/2, point.y - RADIUS/2, RADIUS, RADIUS);
}

function drawRoute(route) {
    //route needs to be passed as arg or smth
    ctx.beginPath();
    ctx.moveTo(route[0].x, route[0].y);
    for (let i = 1; i < route.length; i++) {
        ctx.lineTo(route[i].x, route[i].y);
    }
    ctx.lineTo(route[0].x, route[0].y);
    ctx.stroke();
}

function update(route = []) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points.forEach(point => {drawPoint(point)});
    if (route.length > 0) {
        drawRoute(route);
    }
}