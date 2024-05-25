var canvas = new fabric.Canvas('canvas');
var canvasX = document.getElementById('canvas-overlay-2')
var canvasY = document.getElementById('canvas-overlay')

const unitLengthInput = document.getElementById('unit-length-input')
const translationFactorInput = document.getElementById('translation-factor-input')
const scalingFactorInput = document.getElementById('scaling-factor-input')
const rectangleColorInput = document.getElementById('rectangle-color-input')

const playStopBtn = document.querySelector('.bi-play-fill')
const restartBtn = document.getElementById('restart-btn')
const exportBtn = document.getElementById('export-btn')

const zoomInBtn = document.getElementById('zoom-in-btn')
const zoomOutBtn = document.getElementById('zoom-out-btn')

const tlInput = document.getElementById('tl-input')
const trInput = document.getElementById('tr-input')
const brInput = document.getElementById('br-input')
const blInput = document.getElementById('bl-input')

const logsP = document.getElementById('logs-p')

var zoomFactor = 1;
let intervalId;
let isPlaying = false;

var translationFactor = parseFloat(translationFactorInput.value);
var scalingFactor = parseFloat(scalingFactorInput.value);
var fillColor = rectangleColorInput.value;
var fileString = '';

drawCanvas()
var ctx = canvasY.getContext('2d');
ctx.font = '10px Arial';
ctx.fillStyle = 'black';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('Y', 4, 4);

var ctx2 = canvasX.getContext('2d');
ctx2.font = '10px Arial';
ctx2.fillStyle = 'black';
ctx2.textAlign = 'center';
ctx2.textBaseline = 'middle';
ctx2.fillText('X', 4, 4);

var x1 = 100, y1 = 100, x2 = 310, y2 = 205;
var points = [
    { x: x1, y: y1 },
    { x: x2, y: y1 },
    { x: x2, y: y2 },
    { x: x1, y: y2 }
];
var rect = new fabric.Polygon(points, {
    fill: fillColor,
});
var rectPoints = rect.get('points');
rect.on("modified", function () {
    var matrix = this.calcTransformMatrix();
    var transformedPoints = this.get("points")
        .map(function (p) {
            return new fabric.Point(
                p.x - rect.pathOffset.x,
                p.y - rect.pathOffset.y);
        })
        .map(function (p) {
            return fabric.util.transformPoint(p, matrix);
        });
    rectPoints = transformedPoints
    console.log(toCartesian(transformedPoints));
    putCoordinates(toCartesian(transformedPoints))
});
canvas.add(rect);


function putCoordinates(points) {
    tlInput.value = `(${(points[0].x).toFixed(1)};  ${(points[0].y).toFixed(1)})`;
    trInput.value = `(${(points[1].x).toFixed(1)};  ${(points[1].y).toFixed(1)})`;
    brInput.value = `(${(points[2].x).toFixed(1)};  ${(points[2].y).toFixed(1)})`;
    blInput.value = `(${(points[3].x).toFixed(1)};  ${(points[3].y).toFixed(1)})`;
}
function toCartesian(points) {
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var result = [];
    result.push({ x: (points[0].x - centerX) / 15, y: (centerY - points[0].y) / 15 });
    result.push({ x: (points[1].x - centerX) / 15, y: (centerY - points[1].y) / 15 });
    result.push({ x: (points[2].x - centerX) / 15, y: (centerY - points[2].y) / 15 });
    result.push({ x: (points[3].x - centerX) / 15, y: (centerY - points[3].y) / 15 });

    return result;
}
function vectorByMatrix(vector, matrix) {
    let resultVector = [];

    const a = vector[0] * matrix[0][0] + vector[1] * matrix[0][1] + vector[2] * matrix[0][2];
    const b = vector[0] * matrix[1][0] + vector[1] * matrix[1][1] + vector[2] * matrix[1][2];
    const c = vector[0] * matrix[2][0] + vector[1] * matrix[2][1] + vector[2] * matrix[2][2];

    resultVector.push(a);
    resultVector.push(b);
    resultVector.push(c);

    return resultVector;
}
function matrixByMatrix(matrix1, matrix2) {
    let resultMatrix = [];

    for (let i = 0; i < 3; i++) {
        resultMatrix[i] = [];
        for (let j = 0; j < 3; j++) {
            resultMatrix[i][j] =
                matrix1[i][0] * matrix2[0][j] +
                matrix1[i][1] * matrix2[1][j] +
                matrix1[i][2] * matrix2[2][j];
        }
    }

    return resultMatrix;
}
function moveAndScalePolygon() {
    fileString = '';
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    var tl = { x: rectPoints[0].x, y: rectPoints[0].y }
    var tr = { x: rectPoints[1].x, y: rectPoints[1].y }
    var br = { x: rectPoints[2].x, y: rectPoints[2].y }
    var bl = { x: rectPoints[3].x, y: rectPoints[3].y }

    var tlCartesian = { x: (tl.x - centerX) / 15, y: (centerY - tl.y) / 15 }
    var trCartesian = { x: (tr.x - centerX) / 15, y: (centerY - tr.y) / 15 }
    var brCartesian = { x: (br.x - centerX) / 15, y: (centerY - br.y) / 15 }
    var blCartesian = { x: (bl.x - centerX) / 15, y: (centerY - bl.y) / 15 }

    var tlCartesianVector = [tlCartesian.x, tlCartesian.y, 1];
    var trCartesianVector = [trCartesian.x, trCartesian.y, 1];
    var brCartesianVector = [brCartesian.x, brCartesian.y, 1];
    var blCartesianVector = [blCartesian.x, blCartesian.y, 1];

    var matrix1 = [
        [1, 0, tlCartesian.x],
        [0, 1, tlCartesian.y],
        [0, 0, 1]
    ];
    if ((parseFloat(scalingFactorInput.value) < 1 && parseFloat(translationFactorInput.value) > 0) || (parseFloat(scalingFactorInput.value) > 1 && parseFloat(translationFactorInput.value) < 0)) {
        matrix1 = [
            [1, 0, brCartesian.x],
            [0, 1, brCartesian.y],
            [0, 0, 1]
        ];
    }
    var matrix2 = [
        [scalingFactor, 0, 0],
        [0, scalingFactor, 0],
        [0, 0, 1]
    ];
    var matrix3 = [
        [1, 0, -tlCartesian.x],
        [0, 1, -tlCartesian.y],
        [0, 0, 1]
    ];
    if ((parseFloat(scalingFactorInput.value) < 1 && parseFloat(translationFactorInput.value) > 0) || (parseFloat(scalingFactorInput.value) > 1 && parseFloat(translationFactorInput.value) < 0)) {
        matrix3 = [
            [1, 0, -brCartesian.x],
            [0, 1, -brCartesian.y],
            [0, 0, 1]
        ];
    }
    var matrix4 = [
        [1, 0, translationFactor],
        [0, 1, -translationFactor],
        [0, 0, 1]
    ];

    fileString += '======== Перетворення системи координат: ========\n';
    fileString += matrixToString(matrix1);
    fileString += '\n======== Масштабування: ========\n';
    fileString += matrixToString(matrix2);
    fileString += '\n======== Повернення системи координат до початкового вигляду: ========\n';
    fileString += matrixToString(matrix3);
    fileString += '\n======== Зміщення: ========\n';
    fileString += matrixToString(matrix4);
    
    
    var resultMatrix = matrixByMatrix(matrix1, matrix2)
    resultMatrix = matrixByMatrix(resultMatrix, matrix3)
    resultMatrix = matrixByMatrix(matrix4, resultMatrix)

    fileString += '\n\n======== Матриця результату: ========\n';
    fileString += matrixToString(resultMatrix);

    fileString += '\n\n======== Початкові координати: ========\n';
    fileString += `tl: (${tlCartesian.x}; ${tlCartesian.y})\n`;
    fileString += `tr: (${trCartesian.x}; ${trCartesian.y})\n`;
    fileString += `br: (${brCartesian.x}; ${brCartesian.y})\n`;
    fileString += `bl: (${blCartesian.x}; ${blCartesian.y})\n`;

    var [tlXCartesianTransformed, tlYCartesianTransformed,] = vectorByMatrix(tlCartesianVector, resultMatrix);
    var [trXCartesianTransformed, trYCartesianTransformed,] = vectorByMatrix(trCartesianVector, resultMatrix);
    var [brXCartesianTransformed, brYCartesianTransformed,] = vectorByMatrix(brCartesianVector, resultMatrix);
    var [blXCartesianTransformed, blYCartesianTransformed,] = vectorByMatrix(blCartesianVector, resultMatrix);

    fileString += '\n\n======== Перетворені координати: ========\n';
    fileString += `tl: (${tlXCartesianTransformed}; ${tlYCartesianTransformed})\n`;
    fileString += `tr: (${trXCartesianTransformed}; ${trYCartesianTransformed})\n`;
    fileString += `br: (${brXCartesianTransformed}; ${brYCartesianTransformed})\n`;
    fileString += `bl: (${blXCartesianTransformed}; ${blYCartesianTransformed})\n`;

    var cartesianCoords = [
        { x: tlXCartesianTransformed, y: tlYCartesianTransformed },
        { x: trXCartesianTransformed, y: trYCartesianTransformed },
        { x: brXCartesianTransformed, y: brYCartesianTransformed },
        { x: blXCartesianTransformed, y: blYCartesianTransformed }
    ];
    putCoordinates(cartesianCoords)

    var tlTransformed = { x: tlXCartesianTransformed * 15 + centerX, y: centerY - tlYCartesianTransformed * 15 }
    var trTransformed = { x: trXCartesianTransformed * 15 + centerX, y: centerY - trYCartesianTransformed * 15 }
    var brTransformed = { x: brXCartesianTransformed * 15 + centerX, y: centerY - brYCartesianTransformed * 15 }
    var blTransformed = { x: blXCartesianTransformed * 15 + centerX, y: centerY - blYCartesianTransformed * 15 }

    var newPoints = [tlTransformed, trTransformed, brTransformed, blTransformed];
    rectPoints = newPoints
    canvas.remove(rect);
    rect = new fabric.Polygon(newPoints, {
        fill: fillColor
    });
    rect.on("modified", function () {
        var matrix = this.calcTransformMatrix();
        var transformedPoints = this.get("points")
            .map(function (p) {
                return new fabric.Point(
                    p.x - rect.pathOffset.x,
                    p.y - rect.pathOffset.y);
            })
            .map(function (p) {
                return fabric.util.transformPoint(p, matrix);
            });
        rectPoints = transformedPoints
        putCoordinates(toCartesian(transformedPoints))
    });
    canvas.add(rect);
    rect.setCoords()
    canvas.renderAll();
}
function drawCanvas() {
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;

    var gridSize = 15;
    var gridColor = '#ddd';

    for (var x = centerX % gridSize; x < canvas.width; x += gridSize) {
        var line = new fabric.Line([x, 0, x, canvas.height], {
            stroke: gridColor,
            selectable: false
        });
        canvas.add(line);

        if (Math.floor((x - centerX) / gridSize) != 0) {
            if (Math.floor((x - centerX) / gridSize) < 0) {
                var unitText = new fabric.Text(Math.floor((x - centerX) / gridSize).toString(), {
                    left: x - 10,
                    top: centerY + 2,
                    selectable: false,
                    fontFamily: 'Arial',
                    fontSize: 8
                });
            } else {
                var unitText = new fabric.Text(((Math.floor((x - centerX) / gridSize))).toString(), {
                    left: x + 2,
                    top: centerY + 2,
                    selectable: false,
                    fontFamily: 'Arial',
                    fontSize: 8
                });
            }
            canvas.add(unitText);
        }
    }

    for (var y = centerY % gridSize; y < canvas.height; y += gridSize) {
        var line = new fabric.Line([0, y, canvas.width, y], {
            stroke: gridColor,
            selectable: false
        });
        canvas.add(line);

        if ((-1 * Math.floor((y - centerY) / gridSize)) != 0) {
            if ((-1 * Math.floor((y - centerY) / gridSize)) < 0) {
                var unitText = new fabric.Text((-1 * Math.floor((y - centerY) / gridSize)).toString(), {
                    left: centerX - 15,
                    top: y + 5,
                    selectable: false,
                    fontFamily: 'Arial',
                    fontSize: 8
                });
            } else {
                var unitText = new fabric.Text((-1 * Math.floor((y - centerY) / gridSize)).toString(), {
                    left: centerX - 15,
                    top: y - 8,
                    selectable: false,
                    fontFamily: 'Arial',
                    fontSize: 8
                });
            }
            canvas.add(unitText);
        }
    }

    var xAxis = new fabric.Line([0, centerY, canvas.width, centerY], {
        stroke: 'black',
        selectable: false
    });
    var yAxis = new fabric.Line([centerX, 0, centerX, canvas.height], {
        stroke: 'black',
        selectable: false
    });

    canvas.add(xAxis);
    canvas.add(yAxis);

    canvas.backgroundColor = 'white';
    canvas.renderAll();
}
function matrixToString(matrix) {
    let matrixString = '';
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            matrixString += `${matrix[i][j]}\t`;
        }
        matrixString += '\n';
    }
    return matrixString;
}



// ===================== INPUTS ======================
unitLengthInput.addEventListener('change', () => {
    var zoomFactor = parseFloat(unitLengthInput.value);
    canvas.zoomToPoint(new fabric.Point(canvas.width / 2, canvas.height / 2), zoomFactor);
    canvas.renderAll();
})
translationFactorInput.addEventListener('change', () => {
    translationFactor = parseFloat(translationFactorInput.value);
})
scalingFactorInput.addEventListener('change', () => {
    scalingFactor = parseFloat(scalingFactorInput.value);

})
rectangleColorInput.addEventListener('input', () => {
    fillColor = rectangleColorInput.value;
    rect.set({
        fill: rectangleColorInput.value
    })
    canvas.renderAll()
})
// ====================================================
// ===================== TOOLBAR ======================
playStopBtn.addEventListener('click', () => {
    if (!isPlaying) {
        intervalId = setInterval(moveAndScalePolygon, 20);
        isPlaying = true;
        playStopBtn.classList.remove('bi-play-fill');
        playStopBtn.classList.add('bi-pause-fill');
    } else {
        clearInterval(intervalId);
        isPlaying = false;
        playStopBtn.classList.remove('bi-pause-fill');
        playStopBtn.classList.add('bi-play-fill');
    }
})
restartBtn.addEventListener('click', () => {
    canvas.remove(rect);
    canvas.clear();
    drawCanvas();

    x1 = 100; y1 = 100; x2 = 300; y2 = 200;
    var points = [
        { x: x1, y: y1 },
        { x: x2, y: y1 },
        { x: x2, y: y2 },
        { x: x1, y: y2 }
    ];
    rectPoints = points;
    rect = new fabric.Polygon(points, {
        fill: fillColor,
    });
    rect.on("modified", function () {
        var matrix = this.calcTransformMatrix();
        var transformedPoints = this.get("points")
            .map(function (p) {
                return new fabric.Point(
                    p.x - rect.pathOffset.x,
                    p.y - rect.pathOffset.y);
            })
            .map(function (p) {
                return fabric.util.transformPoint(p, matrix);
            });
        rectPoints = transformedPoints
        putCoordinates(toCartesian(transformedPoints))
    });
    canvas.zoomToPoint(new fabric.Point(canvas.width / 2, canvas.height / 2), 1);
    canvas.add(rect);
})
exportBtn.addEventListener('click', () => {
    var dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1 // 1 means maximum quality
    })

    var link = document.createElement('a')
    link.href = dataURL
    link.download = 'canvas.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
})
// ====================================================

// ======================= ZOOM =======================
zoomInBtn.addEventListener('click', () => {
    zoomFactor += 0.1;
    canvas.zoomToPoint(new fabric.Point(canvas.width / 2, canvas.height / 2), zoomFactor);
    canvas.renderAll();
})
zoomOutBtn.addEventListener('click', () => {
    if (zoomFactor > 1) {
        zoomFactor -= 0.1;
        canvas.zoomToPoint(new fabric.Point(canvas.width / 2, canvas.height / 2), zoomFactor);
        canvas.renderAll();
    }
})
// ====================================================

// ======================= FILE =======================
document.getElementById('write-to-file-btn').addEventListener('click', () => {
    writeToFile();
})
function writeToFile() {

    fetch('/write-to-file', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: fileString })
    })
        .then(response => response.text())
        .then(result => {
            console.log(result);
        })
        .catch(error => console.error('Error:', error));
}
// ====================================================

