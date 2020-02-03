const ctx = document.querySelector('canvas').getContext('2d')

function* enumerate(n) { let i = 0; while(i < n) yield i++; }

let rMin = 256/2
let rMax = 512

let rMin2 = rMin * rMin
let rMinMax2 = rMax * rMax - rMin2

ctx.fillStyle = 'black'

for (let i of enumerate(40000)) {

    let r = Math.sqrt(rMin2 + rMinMax2 * Math.random())
    // let r = rMin + (rMax - rMin) * Math.random()
    let a = 2 * Math.PI * Math.random()
    let x = r * Math.cos(a)
    let y = r * Math.sin(a)

    ctx.beginPath()
    ctx.ellipse(512 + x, 512 + y, 3, 3, 0, 0, 2 * Math.PI)
    ctx.fill()
}
