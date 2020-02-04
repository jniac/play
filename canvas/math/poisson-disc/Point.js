
export default class Point extends Array {

    constructor(x, y) {
        super(x, y)
    }

    scale(scalar) {

        this[0] *= scalar
        this[1] *= scalar
        return this
    }

    get x() { return this[0] }
    get y() { return this[1] }

    set x(value) { this[0] = value }
    set y(value) { this[1] = value }

    get norm() {

        const [x, y] = this
        return Math.sqrt(x * x + y * y)
    }

    set norm(value) {

        return this.scale(value / this.norm)
    }
}
