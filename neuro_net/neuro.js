// based on book http://neuralnetworksanddeeplearning.com/chap1.html
// and article https://javascript.plainenglish.io/make-your-own-neural-network-app-with-plain-javascript-and-a-tiny-bit-of-math-js-30ab5ff4cbd5


// hyper parameters
const inputNodes = 784;
const hiddenNodes = 100;
const outputNodes = 10;
const learningRate = 0.2;
const threshold = 0.5;
let iter = 0;
const iterations = 5;

const trainingDataPath = "./MNIST/mnist_train.csv";
const testDataPath = "./MNIST/mnist_test.csv";
const weightsFilename = "weights.json";
const savedWeightsPath = `./${weightsFilename}`;

const trainingData = [];
const trainingLabels = [];
const testData = [];
const testLabels = [];
const savedWeights = {};

const printSteps = 1000;


class Network {
    constructor(inputNodes, hiddenNodes, outputNodes, learningRate, wInHidden, wHiddenOut) {
        this.inputNodes = inputNodes;
        this.hiddenNodes = hiddenNodes;
        this.outputNodes = outputNodes;
        this.learningRate = learningRate;
        // || is used to either use passed matrix or create a new random one
        this.wInHidden = wInHidden || math.subtract(math.matrix(math.random([hiddenNodes, inputNodes])), 0.5);
        this.wHiddenOut = wHiddenOut || math.subtract(math.matrix(math.random([outputNodes, hiddenNodes])), 0.5);

        //sigmoid activation function
        this.activation = (matrix) => math.map(matrix, (x) => 1 / (1 + Math.exp(-x)));
        this.activationDerivative = (matrix) => math.map(matrix, (x) => x * (1 - x));

    }

    cache = {loss: []};

    feedForward = (input) => {
        input = math.transpose(math.matrix([input]));
        
        let hiddenIn = math.multiply(this.wInHidden, input);
        let hiddenOut = this.activation(hiddenIn);

        let outputIn = math.multiply(this.wHiddenOut, hiddenOut);
        let outputOut = this.activation(outputIn);

        this.cache.input = input;
        this.cache.hiddenOut = hiddenOut;
        this.cache.outputOut = outputOut;
        return outputOut;
    };

    backPropagate = (target) => {
/*
    calculate gradient with chain rule:
    dE/dW = dE/dA * dA/dZ * dZ/dW
    E - error
    W - weight matrix
    A - activation function
    Z - Z = W * X
*/
        target = math.transpose(math.matrix([target]));

        let dEdA = math.subtract(target, this.cache.outputOut);
        let output_dAdZ = this.activationDerivative(this.cache.outputOut);
        let dZdW = math.transpose(this.cache.hiddenOut);
        let hidden_output_nablaE = math.multiply(math.dotMultiply(dEdA, output_dAdZ), dZdW);

        let hidden_dEdA = math.multiply(math.transpose(this.wHiddenOut),
            math.dotMultiply(dEdA, output_dAdZ));
        let hidden_dAdZ = this.activationDerivative(this.cache.hiddenOut);
        let input_hidden_nablaE = math.multiply(math.dotMultiply(hidden_dEdA, hidden_dAdZ),
            math.transpose(this.cache.input));
        
        this.cache.i_h_nablaE = input_hidden_nablaE;
        this.cache.h_o_nablaE = hidden_output_nablaE;
        this.cache.loss.push(math.sum(math.map(dEdA, (x) => x * x)));
    };


    update = () => {
    this.wInHidden = math.add(this.wInHidden,
        math.dotMultiply(this.cache.i_h_nablaE, this.learningRate));
    this.wHiddenOut = math.add(this.wHiddenOut,
        math.dotMultiply(this.cache.h_o_nablaE, this.learningRate));
    };


    predict = (input) => {
        return this.feedForward(input);
    };

    train = (input, target) => {
        this.feedForward(input);
        this.backPropagate(target);
        this.update();
    };

    normalizeData = (data) => {
        return data.map((elem) => (elem / 255) * 0.99 + 0.01);
    };
}


window.onload = async () => {
    net = new Network(inputNodes, hiddenNodes, outputNodes, learningRate);

    trainButton.disabled = true;
    testButton.disabled = true;
    loadWeightsButton.disabled = true;

    status.innerHTML = "Loading the data sets. Please wait ...<br>";

    const trainCSV = await loadData(trainingDataPath, "CSV");
    if (trainCSV) {
        prepareData(trainCSV, trainingData, trainingLabels);
        status.innerHTML += "Training data successfully loaded...<br>";
    }

    const testCSV = await loadData(testDataPath, "CSV");
    if (testCSV) {
        prepareData(testCSV, testData, testLabels);
        status.innerHTML += "Test data successfully loaded...<br>";
    }

    if (!trainCSV || !testCSV) {
        status.innerHTML += "Error loading train/test data set. Check your file path.";
        return;
    }

    trainButton.disabled = false;
    testButton.disabled = false;
    
    const weightsJSON = await loadData(savedWeightsPath, "JSON");

    if (weightsJSON) {
        savedWeights.wInHidden = weightsJSON.wInHidden;
        savedWeights.wHiddenOut = weightsJSON.wHiddenOut;
        loadWeightsButton.disabled = false;
    }

    status.innerHTML += "Ready.<br><br>";
};


async function loadData(path, type) {
    try {
        const result = await fetch(path, {
        mode: "no-cors",
        });

        switch (type) {
            case "CSV":
                return await result.text();
                break;
            case "JSON":
                return await result.json();
                break;
            default:
                return false;
        }
    } catch {
        return false;
    }
}

function prepareData(rawData, target, labels) {
    rawData = rawData.split("\n");
    rawData.pop(); // last element is empty because last line in CSV file is blank
    /*const length = rawData.length * 9 / 10;
    for (let i = 0; i < length; i++) {
        rawData.pop();
    }*/

    rawData.forEach((current) => {
        let sample = current.split(",").map((x) => Number(x));

        labels.push(sample[0]); // first element is used as a lable
        sample.shift(); // remove the first element

        sample = net.normalizeData(sample);

        target.push(sample);
    });
}

function train() {
    trainButton.disabled = true;
    testButton.disabled = true;
    loadWeightsButton.disabled = true;
    download.innerHTML = "";

    if (iter < iterations) {
        iter++;
    
        trainingData.forEach((current, index) => {
            setTimeout(() => {
            /* create one-hot encoding of the label */
                const label = trainingLabels[index];
                const oneHotLabel = Array(10).fill(0);
                oneHotLabel[label] = 0.99;

                net.train(current, oneHotLabel);
                if (index > 0 && !((index + 1) % printSteps)) {
                    status.innerHTML += `finished  ${index + 1}  samples ... <br>`;
                }

                /* check if the end of the training iteration is reached */
                if (index === trainingData.length - 1) {
                    status.innerHTML += `Loss:  ${math.sum(net.cache.loss) / trainingData.length}<br><br>`;
                    net.cache.loss = [];
                    test("", true); // true to signal "test" that it is called from within training 
                }
            }, 0);
        });
    }
}

function test(_, inTraining = false) { 
/* first parameter is for data from event listener */

    trainButton.disabled = true;
    testButton.disabled = true;
    loadWeightsButton.disabled = true;

    status.innerHTML += "Starting testing ...<br>";

    let correctPredicts = 0;
  
    testData.forEach((current, index) => {
        setTimeout(() => {
            const actual = testLabels[index];
    
            const predict = formatPrediction(net.predict(current));
            predict === actual ? correctPredicts++ : null;

            /* check if testing is complete */
            if (index >= testData.length - 1) {
                status.innerHTML += "Accuracy: " + Math.round((correctPredicts / testData.length) * 100) +" %<br><br>";

            /* check if training is complete */
            if (iter + 1 > iterations) {
                createDownloadLink();
                enableAllButtons();
                status.innerHTML += "Finished training.<br><br>";
                iter = 0;
            } else if (inTraining) {
            // if test is called from within training and the training is not complete yet, continue training
                train();
            } else {
                enableAllButtons();
            }
            }  
        }, 0);
    });
}

function predict() {
    /* resize the canvas to the training data image size  */
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(canvas, 0, 0, 150, 150, 0, 0, 28, 28);

    /* convert the canvas image */
    const img = tempCtx.getImageData(0, 0, 28, 28);

    /* remove the alpha channel and convert to grayscale */
    let sample = [];
    for (let i = 0, j = 0; i < img.data.length; i += 4, j++) {
        sample[j] = (img.data[i + 0] + img.data[i + 1] + img.data[i + 2]) / 3;
    }

    img.data = net.normalizeData(img.data);

    const predict = formatPrediction(net.predict(sample));
    status.innerHTML += "Prediction: " + predict + "<br>";
}

function formatPrediction(prediction) {
    const flattened = prediction.toArray().map((x) => x[0]);
    return flattened.indexOf(Math.max(...flattened));
}

function loadWeights() {
    net.wInHidden = savedWeights.wInHidden;
    net.wHiddenOut = savedWeights.wHiddenOut;
    status.innerHTML += "Weights successfully loaded.<br>";
}

function createDownloadLink() {
    const wInHidden = net.wInHidden.toArray();
    const wHiddenOut = net.wHiddenOut.toArray();
    const weights = {wInHidden, wHiddenOut};
    download.innerHTML = `<a download="${weightsFilename}" id="downloadLink" href="data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(weights))}">Download model weights</a>`;
}

/* UI helper functions */

function enableAllButtons() {
  trainButton.disabled = false;
  testButton.disabled = false;
  loadWeightsButton.disabled = false;
}