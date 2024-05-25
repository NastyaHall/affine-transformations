var rectanglee;
function moveAndScaleRectangle() {
    var topLeftCorner = [rect.left, rect.top, 1];
    var bottomRightCorner = [rect.left + rect.width, rect.top + rect.height, 1];

    var [topX, topY,] = vectorByMatrix(topLeftCorner, transformMatrix);
    var [bottomX, bottomY,] = vectorByMatrix(bottomRightCorner, transformMatrix);

    rect.set({
        left: topX,
        top: topY,
        width: (bottomX - topX),
        height: (bottomY - topY)
    });

    canvas.renderAll();
}
function moveAndScaleRectangle2() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const rectPoints = rect.get('points')

    var topX = rect.left;
    var topY = rect.top;
    var bottomX = rect.getCoords()[2].x;
    var bottomY = rect.getCoords()[2].y;
    // var bottomX = rect.getBoundingRect().width + rect.getBoundingRect().left;
    // var bottomY = rect.getBoundingRect().height + rect.getBoundingRect().top;

    var topXCartesian = (topX - centerX) / 15;
    var topYCartesian = (centerY - topY) / 15;
    var bottomXCartesian = (bottomX - centerX) / 15;
    var bottomYCartesian = (centerY - bottomY) / 15;


    var topLeftCornerCartesian = [topXCartesian, topYCartesian, 1];
    var bottomRightCornerCartesian = [bottomXCartesian, bottomYCartesian, 1];

    var matrix1 = [
        [1, 0, topXCartesian],
        [0, 1, topYCartesian],
        [0, 0, 1]
    ];
    var matrix2 = [
        [scalingFactor, 0, 0],
        [0, scalingFactor, 0],
        [0, 0, 1]
    ];
    var matrix3 = [
        [1, 0, -topXCartesian],
        [0, 1, -topYCartesian],
        [0, 0, 1]
    ];
    var matrix4 = [
        [1, 0, translationFactor],
        [0, 1, -translationFactor],
        [0, 0, 1]
    ];

    var resultMatrix = matrixByMatrix(matrix1, matrix2)
    resultMatrix = matrixByMatrix(resultMatrix, matrix3)
    resultMatrix = matrixByMatrix(matrix4, resultMatrix)

    var [topXCartesianTransformed, topYCartesianTransformed,] = vectorByMatrix(topLeftCornerCartesian, resultMatrix);
    var [bottomXCartesianTransformed, bottomYCartesianTransformed,] = vectorByMatrix(bottomRightCornerCartesian, resultMatrix);

    var topXTransformed = topXCartesianTransformed * 15 + centerX;
    var topYTransformed = centerY - topYCartesianTransformed * 15;
    var bottomXTransformed = bottomXCartesianTransformed * 15 + centerX;
    var bottomYTransformed = centerY - bottomYCartesianTransformed * 15;

    rect.set({
        left: topXTransformed,
        top: topYTransformed,
        width: (bottomXTransformed - topXTransformed),
        height: (bottomYTransformed - topYTransformed)
    });
    // rect.setCoords()
    canvas.renderAll();
}

function rotateRectangle(rectangle, degree) {
    var rectCenter = { x: (rectangle.tl.x + rectangle.br.x) / 2, y: (rectangle.tl.y + rectangle.br.y) / 2 };
    var translateCoordinateSystemMatrix = [
        [1, 0, -rectCenter.x],
        [0, 1, -rectCenter.y],
        [0, 0, 1]
    ];
    var rotateMatrix = [
        [Math.cos(-degree), Math.sin(-degree), 0],
        [-Math.sin(-degree), Math.cos(-degree), 0],
        [0, 0, 1]
    ];
    var translateCoordinateSystemBackMatrix = [
        [1, 0, rectCenter.x],
        [0, 1, rectCenter.y],
        [0, 0, 1]
    ];
    var resultMatrix = matrixByMatrix(translateCoordinateSystemMatrix, rotateMatrix);
    resultMatrix = matrixByMatrix(resultMatrix, translateCoordinateSystemBackMatrix);

    var tlVector = [rectangle.tl.x, rectangle.tl.y, 1];
    var trVector = [rectangle.tr.x, rectangle.tr.y, 1];
    var brVector = [rectangle.br.x, rectangle.br.y, 1];
    var blVector = [rectangle.bl.x, rectangle.bl.y, 1];

    var [tlXTransformed, tlYTransformed,] = vectorByMatrix(tlVector, resultMatrix);
    var [trXTransformed, trYTransformed,] = vectorByMatrix(trVector, resultMatrix);
    var [brXTransformed, brYTransformed,] = vectorByMatrix(brVector, resultMatrix);
    var [blXTransformed, blYTransformed,] = vectorByMatrix(blVector, resultMatrix);

    rectangle.tl.x = tlXTransformed; rectangle.tl.y = tlYTransformed;
    rectangle.tr.x = trXTransformed; rectangle.tl.y = trYTransformed;
    rectangle.br.x = brXTransformed; rectangle.tl.y = brYTransformed;
    rectangle.bl.x = blXTransformed; rectangle.tl.y = blYTransformed;
}

const myCanvas = document.getElementById('myCanvas');

canvas.addEventListener('mousedown', function (event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate the angle
    const deltaX = mouseX - centerX;
    const deltaY = centerY - mouseY; // Invert Y-axis

    const angleRadians = Math.atan2(deltaY, deltaX);
    const angleDegrees = angleRadians * (180 / Math.PI);

    rotateRectangle(rectanglee, angleDegrees);
});

function onMouseDown(e) {
    const rectCanvas = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rectCanvas.left;
    const mouseY = e.clientY - rectCanvas.top;

    currentHandle = getHandle(mouseX, mouseY);
    if (currentHandle) {
        isResizing = true;
    }
}

function onMouseMove(e) {
    if (!isResizing) return;

    const rectCanvas = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rectCanvas.left;
    const mouseY = e.clientY - rectCanvas.top;

    switch (currentHandle) {
        case 'tl':
            rect.width += rect.x - mouseX;
            rect.height += rect.y - mouseY;
            rect.x = mouseX;
            rect.y = mouseY;
            break;
        case 'tr':
            rect.width = mouseX - rect.x;
            rect.height += rect.y - mouseY;
            rect.y = mouseY;
            break;
        case 'bl':
            rect.width += rect.x - mouseX;
            rect.x = mouseX;
            rect.height = mouseY - rect.y;
            break;
        case 'br':
            rect.width = mouseX - rect.x;
            rect.height = mouseY - rect.y;
            break;
        case 'tm':
            rect.height += rect.y - mouseY;
            rect.y = mouseY;
            break;
        case 'bm':
            rect.height = mouseY - rect.y;
            break;
        case 'ml':
            rect.width += rect.x - mouseX;
            rect.x = mouseX;
            break;
        case 'mr':
            rect.width = mouseX - rect.x;
            break;
    }

    draw();
}

function onMouseUp() {
    isResizing = false;
    currentHandle = null;
}

let isResizing = false;
let currentHandle = null;

const handleSize = 10;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw rectangle
    ctx.fillStyle = 'lightgrey';
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

    // Draw handles
    ctx.fillStyle = 'blue';
    // Top-left
    ctx.fillRect(rect.x - handleSize / 2, rect.y - handleSize / 2, handleSize, handleSize);
    // Top-right
    ctx.fillRect(rect.x + rect.width - handleSize / 2, rect.y - handleSize / 2, handleSize, handleSize);
    // Bottom-left
    ctx.fillRect(rect.x - handleSize / 2, rect.y + rect.height - handleSize / 2, handleSize, handleSize);
    // Bottom-right
    ctx.fillRect(rect.x + rect.width - handleSize / 2, rect.y + rect.height - handleSize / 2, handleSize, handleSize);
    // Top-middle
    ctx.fillRect(rect.x + rect.width / 2 - handleSize / 2, rect.y - handleSize / 2, handleSize, handleSize);
    // Bottom-middle
    ctx.fillRect(rect.x + rect.width / 2 - handleSize / 2, rect.y + rect.height - handleSize / 2, handleSize, handleSize);
    // Middle-left
    ctx.fillRect(rect.x - handleSize / 2, rect.y + rect.height / 2 - handleSize / 2, handleSize, handleSize);
    // Middle-right
    ctx.fillRect(rect.x + rect.width - handleSize / 2, rect.y + rect.height / 2 - handleSize / 2, handleSize, handleSize);
}

function getHandle(x, y) {
    if (x >= rect.x - handleSize / 2 && x <= rect.x + handleSize / 2 && y >= rect.y - handleSize / 2 && y <= rect.y + handleSize / 2) {
        return 'tl';
    }
    if (x >= rect.x + rect.width - handleSize / 2 && x <= rect.x + rect.width + handleSize / 2 && y >= rect.y - handleSize / 2 && y <= rect.y + handleSize / 2) {
        return 'tr';
    }
    if (x >= rect.x - handleSize / 2 && x <= rect.x + handleSize / 2 && y >= rect.y + rect.height - handleSize / 2 && y <= rect.y + rect.height + handleSize / 2) {
        return 'bl';
    }
    if (x >= rect.x + rect.width - handleSize / 2 && x <= rect.x + rect.width + handleSize / 2 && y >= rect.y + rect.height - handleSize / 2 && y <= rect.y + rect.height + handleSize / 2) {
        return 'br';
    }
    if (x >= rect.x + rect.width / 2 - handleSize / 2 && x <= rect.x + rect.width / 2 + handleSize / 2 && y >= rect.y - handleSize / 2 && y <= rect.y + handleSize / 2) {
        return 'tm';
    }
    if (x >= rect.x + rect.width / 2 - handleSize / 2 && x <= rect.x + rect.width / 2 + handleSize / 2 && y >= rect.y + rect.height - handleSize / 2 && y <= rect.y + rect.height + handleSize / 2) {
        return 'bm';
    }
    if (x >= rect.x - handleSize / 2 && x <= rect.x + handleSize / 2 && y >= rect.y + rect.height / 2 - handleSize / 2 && y <= rect.y + rect.height / 2 + handleSize / 2) {
        return 'ml';
    }
    if (x >= rect.x + rect.width - handleSize / 2 && x <= rect.x + rect.width + handleSize / 2 && y >= rect.y + rect.height / 2 - handleSize / 2 && y <= rect.y + rect.height / 2 + handleSize / 2) {
        return 'mr';
    }
    return null;
}