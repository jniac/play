let canvas = document.querySelector('canvas')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
paper.setup(canvas)

function* enumerate(n) { let i = 0; while(i < n) yield i++ }
function* range(from, to) { while(from < to) yield from++ }

const { view, Group, Path, Point, Color } = paper

const root = new Group({
    applyMatrix: false,
    position: view.center,
})

window.addEventListener('resize', () => {

    const { innerWidth:width, innerHeight:height } = window
    canvas.width = width
    canvas.height = height
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    view.setViewSize(width, height)
    view.fire('resize')
    
    root.position = view.center
})


const sinCircle = ({ radius, step = 1024, period }) => {

    let path = new Path({
        strokeColor: 'black',
        strokeWidth: 1,
        // fillColor: '#96acd5',
        applyMatrix: false,
        closed: true,
        parent: root,
    })

    for (let i of enumerate(step)) {
        let angle = 2 * Math.PI * (i / step - .25)
        let r = radius + 15 * Math.cos((i / step) * 2 * Math.PI * period)
        let x = r * Math.cos(angle)
        let y = r * Math.sin(angle)
        path.add(new Point(x, y))
    }
}

sinCircle({ radius:370, period:24 })

// new Path.Circle({
//     position: view.center,
//     applyMatrix: false,
//     radius: 450,
//     fillColor: {
//         gradient: {
//             stops: [['#ff0068', 1], ['#ff006800', 0]],
//             radial: true
//         },
//         origin: view.center,
//         destination: view.center.add(450, 0),
//     },
// })

// new Path.Circle({
//     center: view.center,
//     radius: 360,
//     strokeColor: 'black',
//     strokeWidth: 1.5,
// })

// new Path.Circle({
//     center: view.center,
//     radius: 305,
//     strokeColor: 'black',
//     strokeWidth: 1.5,
//     // fillColor: 'white',
//     applyMatrix: false,
// })

const centralGear = ({ radius, fillColor, offset = 0, speed = 1, excentric = 20, ...props }) => {

    let gear = new Path.Circle({
        radius,
        fillColor,
        applyMatrix: false,
        parent: root,
        ...props
    })

    let t = offset
    gear.on('frame', () => {
        t += 1 / 60
        angle = t * speed * .2
        let x = excentric * Math.cos(angle)
        let y = excentric * Math.sin(angle)
        gear.position = [x, y]
    })
}

const cross = ({ size = 10, strokeColor = 'black', strokeWidth = 2, ...props }) => {

    let group = new paper.Group({
        applyMatrix:false,
        ...props
    })

    new Path.Line({
        from: [-size, 0],
        to: [size, 0],
        strokeColor,
        strokeWidth,
        applyMatrix: false,
        parent: group,
    })

    new Path.Line({
        from: [0, -size],
        to: [0, size],
        strokeColor,
        strokeWidth,
        applyMatrix: false,
        parent: group,
    })

    return group
}


centralGear({
    radius: 170,
    // fillColor: '#c696d5',
    // fillColor: '#7A66A4',
    fillColor: 'black',
    offset: 40,
    speed: .5,
    excentric: 10,
})

centralGear({
    radius: 160,
    fillColor: 'white',
    strokeColor: 'black',
    strokeWidth: 1.5,
    offset: 10,
    speed: .5,
    excentric: 30,
})

centralGear({
    radius: 150,
    fillColor: 'goldenrod',
})

const drawShell = ({ radius, strokeWidth, strokeColor = 'black', step = 32 * 2 }) => {

    const cos01 = x => .5 - .5 * Math.cos(x * 2 * Math.PI)

    let group = new paper.Group({
        rotation:45,
        applyMatrix:false,
        parent: root,
    })
    group.on('frame', () => group.rotation += -.01)

    let p0 = new Point(0, -radius)

    new Path.Circle({
        center: p0,
        radius: 48,
        // strokeColor: 'black',
        fillColor: '#fff',
        parent: group,
    })

    let cr = cross({
        position: p0,
        strokeColor: 'black',
        parent: group,
        size: 44,
        strokeWidth: 1.5,
    })
    cr.on('frame', () => cr.rotation += .1)


    for (let i of range(2, step - 1)) {
        let angle = 2 * Math.PI * (i / step - .25)
        let x = radius * Math.cos(angle)
        let y = radius * Math.sin(angle)
        let p1 = new Point(x, y)

        let v = p1.subtract(p0)
        v.length = 50

        let p2 = p0.add(v)

        new Path.Line({
            from: p2,
            to: p1,
            strokeColor,
            strokeWidth,
            applyMatrix: false,
            parent: group,
        })

        const addCircle = (offset = 0) => {

            let chip = new Path.Rectangle({
            // let chip = new Path.Circle({
                // center: p1,
                // radius: 3,
                size: 4,
                fillColor: 'black',
                applyMatrix: false,
                parent: group,
                rotation: 180 / Math.PI * Math.atan2(v.y, v.x) + 45
            })

            let v21 = p1.subtract(p2)
            let t = cos01(i / step) * .2
            let s = cos01(i / step)
            chip.on('frame', () => {
                t += 1 / 60 * .05
                t %= 1
                chip.position = p2.add(v21.multiply(cos01(t)))
                chip.scaling = (1 + 2 * cos01(t)) * s
            })
        }

        addCircle()
    }

}

drawShell({
    radius:300,
    strokeWidth:1.5,
})

centralGear({
    radius: 130,
    strokeColor: 'black',
    strokeWidth: 1.5,
    fillColor: '#daa520',
})
