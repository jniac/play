const ctx = document.querySelector('canvas').getContext('2d')

function* enumerate(n) { let i = 0; while(i < n) yield i++; }

const drawLine = (A, B, { color = 'black', lineWidth = 1 } = {}) => {

    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.beginPath()
    ctx.moveTo(A.x, A.y)
    ctx.lineTo(B.x, B.y)
    ctx.stroke()
}

const drawVector = (origin, direction, { arrowSize = 8, ...options } = {}) => {

    const destination = Point.add(origin, direction)
    const v = direction.clone.normalize(arrowSize)
    drawLine(origin, destination, options)
    drawLine(destination, destination.clone.add(v.clone.rotate(135)), options)
    drawLine(destination, destination.clone.add(v.clone.rotate(-135)), options)

}

const drawTriangle = (A, B, C) => {
    drawLine(A, B)
    drawLine(B, C)
    drawLine(C, A)
}

const drawDot = (P, r = 1) => {
    ctx.beginPath()
    ctx.arc(P.x, P.y, r, 0, 2 * Math.PI)
    ctx.fill()
}

const drawPoint = P => {
    drawLine(P.clone.add({ x:10 }), P.clone.add({ x:-10 }))
    drawLine(P.clone.add({ y:10 }), P.clone.add({ y:-10 }))
}

class Point extends Array {
    constructor(x, y) {
        super(x, y)
    }
    get x() { return this[0] }
    get y() { return this[1] }
    get clone() { return new Point(...this) }
    add({ x = 0, y = 0}) {
        this[0] += x
        this[1] += y
        return this
    }
    sub({ x = 0, y = 0}) {
        this[0] -= x
        this[1] -= y
        return this
    }
    scale(scalar) {
        this[0] *= scalar
        this[1] *= scalar
        return this
    }
    get len() {
        const [x, y] = this
        return Math.sqrt(x * x + y * y)
    }
    normalize(len = 1) {
        return this.scale(len / this.len)
    }
    rotate(angle, { degree = true } = {}) {
        if (degree)
            angle *= Math.PI / 180
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        const [x, y] = this
        this[0] = x * cos - y * sin
        this[1] = x * sin + y * cos
        return this
    }
    static add(A, B) { return A.clone.add(B) }
    static sub(A, B) { return A.clone.sub(B) }
    static scale(A, scalar) { return A.clone.scale(scalar) }
}
