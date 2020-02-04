const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
let { width, height } = canvas

const dpr = 2

Object.assign(canvas.style, {
    width: `${width/dpr}px`,
    height: `${height/dpr}px`,
})

// enhance ctx API
Object.assign(ctx, {

    circle(x, y, r) {
        this.ellipse(x, y, r, r, 0, 0, 2 * Math.PI)
    },

    ring(x, y, rMin, rMax) {
        this.circle(x, y, rMax)
        this.circle(x, y, rMin)
    }

})


let time = 0, dt = 1 / 60, paused = false
let timeScale = 1

class Transform {

    constructor({ x = 0, y = 0, scale = 1, scaleX = 1, scaleY = 1, rotation = 0 } = {}) {

        Object.assign(this, { x, y, scale, scaleX, scaleY, rotation })
        this.matrix = [1, 0, 0, 1, 0, 0]
        this.dirty = false
    }

    update() {

        const { x, y, scale, scaleX, scaleY, rotation } = this
        const angle = rotation * Math.PI / 180
        const cos = Math.cos(angle), sin = Math.sin(angle)

        this.matrix = [
            scale * scaleX * cos,
            scale * scaleX * -sin,
            scale * scaleY * sin,
            scale * scaleY * cos,
            x,
            y
        ]
    }
}

class CanvasElement {

    static instances = []

    constructor(props) {

        this.transform = new Transform()

        Object.assign(this, props, {

            birthTime: time,

        })

        CanvasElement.instances.push(this)
    }

    get ctx() { return ctx }

    draw() { /* placeholder, or virtual method may say oop dev */ }

    kill() {

        Object.assign(this, {
            killed: true,
            deathTime: time,
        })
    }
}

for (let key of ['x', 'y', 'scale', 'scaleX', 'scaleY', 'rotation']) {

    Object.defineProperty(CanvasElement.prototype, key, {
        enumerable:true,
        get() { return this.transform[key] },
        set(value) {
            this.transform[key] = value
            this.transform.dirty = true
        },
    })

}

class Grid extends CanvasElement {

    static MAX_SIZE = 1e3

    draw() {

        const {

            step = 20,
            color = '#ccc',
            thickness = 1,
            col = Grid.MAX_SIZE,
            row = Grid.MAX_SIZE,

        } = this

        let i, x = 0, y = 0

        ctx.strokeStyle = color
        ctx.lineWidth = thickness
        ctx.beginPath()

        i = 0
        while (i++ <= col && x <= width) {
            ctx.moveTo(x, 0)
            ctx.lineTo(x, row * step)
            x += step
        }

        i = 0
        while (i++ <= row && y <= height) {
            ctx.moveTo(0, y)
            ctx.lineTo(col * step, y)
            y += step
        }

        ctx.stroke()
    }
}

class Circle extends CanvasElement {

    draw() {

        const {

            r = 4,
            x = 10,
            y = 10,
            strokeColor = '#ccc',
            strokeWidth = 0,
            fillColor = 'black',

        } = this

        ctx.beginPath()
        ctx.circle(x, y, r)

        if (strokeWidth) {
            ctx.strokeStyle = strokeColor
            ctx.lineWidth = strokeWidth
            ctx.stroke()
        }

        ctx.fillStyle = fillColor
        ctx.fill()
    }
}



const onDraw = new Set()
const ON_DRAW_KILL = Symbol('ON_DRAW_KILL')

const wait = delay => new Promise(resolve => {

    const timeEnd = time + delay

    onDraw.add(time => {

        if (time > timeEnd) {

            resolve()
            return ON_DRAW_KILL
        }

    })
})

const saveEdgeTransform = () => {

    // slightly transform the canvas space to let the first and last lines
    // of the grid be visible (not half-drawn)
    ctx.setTransform((width - 1) / width, 0, 0, (height - 1) / height, .5, .5)

}

const drawFrame = t => {

    requestAnimationFrame(drawFrame)

    if (paused)
        return

    time += dt * timeScale

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, width, height)

    for (let element of CanvasElement.instances) {

        if (!element.killed) {

            if (element.transform.dirty)
                element.transform.update()

            saveEdgeTransform()
            ctx.transform(...element.transform.matrix)
            element.draw()
        }
    }

    for (let cb of onDraw)
        if (cb(time, dt) === ON_DRAW_KILL)
            onDraw.delete(cb)
}

requestAnimationFrame(drawFrame)






// DEBUG:
Object.assign(window, {
    CanvasElement,
})

export {

    CanvasElement,
    Grid,
    Circle,

    ctx,
    width,
    height,

    time,
    timeScale,
    paused,
    onDraw,
    wait,

}

export default {

    CanvasElement,
    Grid,
    Circle,

    ctx,
    width,
    height,

    get time() { return time },
    get timeScale() { return timeScale },
    set timeScale(value) { timeScale = value },
    get paused() { return paused },
    set paused(value) { paused = value },
    onDraw,
    wait,

}
