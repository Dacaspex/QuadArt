class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class AnnotatedPoint extends Point {
    constructor(x, y, data) {
        super(x, y);
        this.data = data;
    }
}

class Rectangle {
    /**
     * @param x x-coordinate of lower left corner
     * @param y y-coordinate of lower left corner
     * @param width
     * @param height
     */
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    contains(x, y) {
        return x > this.x
            && x < this.x + this.width
            && y > this.y
            && y < this.y + this.height;
    }
}

class QuadTree {
    constructor(boundary) {
        this.rectangle = boundary;
        this.northEast = null;
        this.northWest = null;
        this.southEast = null;
        this.southWest = null;
        this.point = null;
    }

    getSubTrees() {
        return [this.northEast, this.northWest, this.southEast, this.southWest];
    }

    getRectangles() {
        let rectangles = [this.rectangle];
        rectangles = this.northEast != null ? rectangles.concat(this.northEast.getRectangles()) : rectangles;
        rectangles = this.northWest != null ? rectangles.concat(this.northWest.getRectangles()) : rectangles;
        rectangles = this.southEast != null ? rectangles.concat(this.southEast.getRectangles()) : rectangles;
        rectangles = this.southWest != null ? rectangles.concat(this.southWest.getRectangles()) : rectangles;

        return rectangles;
    }

    getPoints() {
        let points = [this.point];
        points = this.northEast != null ? points.concat(this.northEast.getPoints()) : points;
        points = this.northWest != null ? points.concat(this.northWest.getPoints()) : points;
        points = this.southEast != null ? points.concat(this.southEast.getPoints()) : points;
        points = this.southWest != null ? points.concat(this.southWest.getPoints()) : points;

        return points.filter(p => p != null);
    }

    insert(point) {
        // Check if point can be added to this rectangle
        if (!this.rectangle.contains(point.x, point.y)) {
            return false;
        }

        if (this.point == null) {
            this.point = point;
            return;
        }

        // Construct new subtrees rooted at this tree
        const other = this.point;
        const xRoot = this.rectangle.x;
        const yRoot = this.rectangle.y;
        const width = this.rectangle.width / 2;
        const height = this.rectangle.height / 2;
        this.northEast = new QuadTree(new Rectangle(xRoot + width, yRoot + height, width, height));
        this.northWest = new QuadTree(new Rectangle(xRoot, yRoot + height, width, height));
        this.southEast = new QuadTree(new Rectangle(xRoot + width, yRoot, width, height));
        this.southWest = new QuadTree(new Rectangle(xRoot, yRoot, width, height));
        this.point = null;

        // Add both points to the new subtrees
        const successOriginal = this.getSubTrees().map(subTree => subTree.insert(point));
        const successSaved = this.getSubTrees().map(subTree => subTree.insert(other));

        return successOriginal && successSaved;
    }
}