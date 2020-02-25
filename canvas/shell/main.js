let canvas = document.querySelector('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
paper.setup(canvas)

function* enumerate(n) { let i = 0; while(i < n) yield i++ }
function* range(from, to) { while(from < to) yield from++ }

const { view, Path, Point, Color } = paper

let circle = new Path.Circle({
    center: view.center,
    radius: 150,
    strokeColor: 'black',
    strokeWidth: 20,
    fillColor: 'goldenrod',
})

const drawShell = ({ radius, strokeWidth, strokeColor = 'black', step = 32 }) => {

    let p0 = view.center.add(0, -radius)

    for (let i of range(1, step)) {
        let angle = 2 * Math.PI * (i / step - .25)
        let x = radius * Math.cos(angle)
        let y = radius * Math.sin(angle)
        let p1 = view.center.add(x, y)

        let v = p1.subtract(p0)
        v.length = 50

        new Path.Line({
            from: p0.add(v),
            to: p1,
            strokeColor,
            strokeWidth,
        })
    }

}

drawShell({ radius:300, strokeWidth:1.5 })
