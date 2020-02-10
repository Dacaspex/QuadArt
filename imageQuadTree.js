class ImageQuadTree {
    constructor(rectangle, level = 0) {
        this.rectangle = rectangle;
        this.northEast = null;
        this.northWest = null;
        this.southEast = null;
        this.southWest = null;
        this.level = level;
    }

    isDivided() {
        return this.northEast !== null;
    }

    getSubTrees() {
        return [this.northEast, this.northWest, this.southEast, this.southWest];
    }

    getRectangle() {
        return this.rectangle;
    }

    getRectangles() {
        if (this.isDivided()) {
            let rectangles = [];
            this.getSubTrees().forEach(subTree => {
                rectangles = rectangles.concat(subTree.getRectangles());
            });

            return rectangles;
        } else {
            return [this.rectangle];
        }
    }

    divide() {
        const xRoot = this.rectangle.x;
        const yRoot = this.rectangle.y;
        const width = this.rectangle.width / 2;
        const height = this.rectangle.height / 2;
        this.southEast = new ImageQuadTree(new Rectangle(xRoot + width, yRoot + height, width, height), this.level + 1);
        this.southWest = new ImageQuadTree(new Rectangle(xRoot, yRoot + height, width, height), this.level + 1);
        this.northEast = new ImageQuadTree(new Rectangle(xRoot + width, yRoot, width, height), this.level + 1);
        this.northWest = new ImageQuadTree(new Rectangle(xRoot, yRoot, width, height), this.level + 1);
    }
}