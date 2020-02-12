function getPixelData(image, width, height) {
    // Intermediate buffer to extract pixel data
    const buffer = document.createElement('canvas');
    const bufferCtx = buffer.getContext('2d');
    const pixelData = [];

    // In order to obtain pixel data, we must first draw the image
    // to the canvas and then get the data
    buffer.width = width;
    buffer.height = height;
    bufferCtx.drawImage(image, 0, 0, width, height);
    const data = bufferCtx.getImageData(0, 0, width, height).data;

    // Data contains a 1D array with all red, green, blue and transparency
    // values. Extract these values and map those to x, y coordinates
    let r, g, b, a;
    let x = 0;
    let y = 0;

    // Length of data array is width * height * 4 for each colour component
    for (let i = 0; i < width * height * 4; i += 4) {
        r = data[i];
        g = data[i + 1];
        b = data[i + 2];
        a = data[i + 3];

        // Make sure the array is initialised before writing data
        if (pixelData[x] === undefined) {
            pixelData[x] = [];
        }

        pixelData[x][y] = [r, g, b, a];

        // Bookkeeping of x, y coordinates
        x += 1;
        if (x === width) {
            y += 1;
            x = 0;
        }
    }

    return pixelData;
}

function buildQuadTree(pixelData, width, height, maxLevel, threshold) {
    const boundary = new Rectangle(0, 0, width, height);
    const quadTree = new ImageQuadTree(boundary);
    const stack = [quadTree];

    // Build quad tree with a stack approach
    let candidate = null;
    while (stack.length !== 0) {
        candidate = stack.shift();

        if (getColourDeviation(pixelData, candidate.rectangle) <= threshold) {
            continue;
        }

        if (candidate.level <= maxLevel) {
            candidate.divide();
            candidate.getSubTrees().forEach(subTree => stack.push(subTree));
        }
    }

    return quadTree;
}

function renderQuadTree(ctx, width, height, pixelData, quadTree, settings) {
    const boundary = quadTree.getRectangle();
    const rectangles = quadTree.getRectangles();

    // Clear canvas
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, boundary.width, boundary.height);

    switch (settings.shapeType) {
        case ShapeType.RECTANGLES:
            renderRectangles(ctx, pixelData, rectangles, settings.shapes.rectangle);
            break;
        case ShapeType.CIRCLES:
            renderCircles(ctx, width, height, pixelData, rectangles, settings.shapes.circle);
            break;
    }
}

function renderRectangles(ctx, pixelData, rectangles, settings) {
    // Render quad tree as rectangles
    let x, y, width, height, rgb;
    rectangles.forEach(rectangle => {
        x = rectangle.x;
        y = rectangle.y;
        width = rectangle.width;
        height = rectangle.height;
        rgb = getAverageColour(pixelData, x, y, width, height);

        ctx.fillStyle = rgbToHex(rgb);
        ctx.fillRect(x, y, width, height);

        ctx.strokeStyle = settings.edgeColor;
        ctx.strokeRect(x, y, width, height);
    });
}

function renderCircles(ctx, width, height, pixelData, rectangles, settings) {
    // Render background
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Render quad tree as circles
    let x, y, rWidth, rHeight, rgb;
    rectangles.forEach(rectangle => {
        x = rectangle.x;
        y = rectangle.y;
        rWidth = rectangle.width;
        rHeight = rectangle.height;
        rgb = getAverageColour(pixelData, x, y, rWidth, rHeight);

        ctx.beginPath();
        ctx.arc(x + rWidth / 2, y + rHeight / 2, rWidth / 2, 0, 2 * Math.PI);
        ctx.fillStyle = rgbToHex(rgb);
        ctx.fill();

        ctx.lineWidth = 1;
        ctx.strokeStyle = settings.edgeColor;
        ctx.stroke();
    });
}

function getColourDeviation(pixelData, rectangle) {
    // TODO: This is a naive method for calculating deviation, implement better method
    let data = null;
    let sum = null;
    let max = [0, 0, 0];
    let min = [255, 255, 255];

    for (let i = Math.round(rectangle.x); i < rectangle.x + rectangle.width; i++) {
        for (let j = Math.round(rectangle.y); j < rectangle.y + rectangle.height; j++) {
            data = pixelData[i][j];
            sum = data[0] + data[1] + data[2];
            if (sum > max[0] + max[1] + max[2]) {
                max = [data[0], data[1], data[2]];
            }
            if (sum < min[0] + min[1] + min[2]) {
                min = [data[0], data[1], data[2]];
            }
        }
    }

    return Math.sqrt(
        Math.pow(max[0] - min[0], 2)
        + Math.pow(max[1] - min[1], 2)
        + Math.pow(max[2] - min[2], 2)
    );
}

function getAverageColour(pixelData, x, y, width, height) {
    // TODO: This is a naive method for calculating average, implement better method
    let data = null;
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;

    for (let i = Math.round(x); i < x + width; i++) {
        for (let j = Math.round(y); j < y + height; j++) {
            data = pixelData[i][j];
            rSum += data[0];
            gSum += data[1];
            bSum += data[2];
        }
    }

    const size = width * height;
    return [Math.round(rSum / size), Math.round(gSum / size), Math.round(bSum / size)];
}

function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(rgb) {
    return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
}