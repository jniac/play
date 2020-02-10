
ctx.scale(2, 2)
ctx.translate(50, 0)

ctx.translate(0, 250)

let A = new Point(0, 0)
let B = new Point(340, 0)
let C = new Point(300, -200)

let M = new Point(220, -80)



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



C = new Point(100, -200)
ctx.translate(500, 0)
drawTriangle(A, B, C)

let randomPoint1 = (width, C) => {
    let r1 = Math.random()
    let r2 = Math.random()
    let color = r1 + r2 < 1 ? 'blue' : 'red'
    let y = C.y * r1
    let x = width * r2 + C.x * r1
    let p = new Point(x, y)
    p.color = color
    return p
}

for (let i of enumerate(3000)) {
    let p = randomPoint1(B.x, C)
    ctx.fillStyle = p.color
    drawDot(p)
}


ctx.translate(0, 250)
drawTriangle(A, B, C)

let randomPoint2 = (width, C) => {
    let p = Math.random()
    let q = Math.random()

    let color = p + q < 1 ? 'blue' : 'red'

    if (p + q > 1) {
        p = (1 - p)
        q = (1 - q)
    }

    let x = width * p + C.x * q
    let y = C.y * q
    let P = new Point(x, y)
    P.color = color
    return P
}


for (let i of enumerate(3000)) {
    let p = randomPoint2(B.x, C)
    ctx.fillStyle = p.color
    drawDot(p)
}





ctx.translate(0, 250)
drawTriangle(A, B, C)

let randomPoint3 = (width, C) => {
    let p = Math.random()
    let q = Math.random() * (1 - p)

    let x = width * p + C.x * q
    let y = q * C.y

    return new Point(x, y)
}

for (let i of enumerate(3000)) {
    let p = randomPoint3(B.x, C)
    ctx.fillStyle = 'black'
    drawDot(p)
}







ctx.translate(-500, 0)
drawTriangle(A, B, C)

let randomPoint4 = (width, C) => {
    let p = Math.sqrt(Math.random())
    let q = Math.random();

    let x = width * p * (1 - q) + C.x * p * q
    let y = C.y * p * q

    return new Point(x, y)
}

for (let i of enumerate(3000)) {
    let p = randomPoint4(B.x, C)
    ctx.fillStyle = 'black'
    drawDot(p)
}
