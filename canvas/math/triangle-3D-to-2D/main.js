const ctx = document.querySelector('canvas').getContext('2d')

function* enumerate(n) { let i = 0; while(i < n) yield i++; }

ctx.translate(300, 500)
ctx.scale(2, 2)

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

const A = new Point(0, 0)
const B = new Point(340, 0)
const C = new Point(300, -200)

const M = new Point(220, -80)



// here is the important stuff
// hard math, isn't it ?
let kc = M.y / C.y
let kb = (M.x - kc * C.x) / B.x



drawTriangle(A, B, C)
drawPoint(M)

drawVector(A, B.clone.scale(kb), {
    color: 'blue',
    lineWidth: 2,
})
drawVector(B.clone.scale(kb), C.clone.scale(kc), {
    color: 'red',
    lineWidth: 2,
})
