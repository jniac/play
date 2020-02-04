import { CanvasElement } from './engine.js'

export default class Dot extends CanvasElement {

    static count = 0

    constructor(props) {
        super({ r:7, ...props, id:Dot.count++ })
    }

    link(other) {

        Object.assign(this, {
            status: 'candidate-linked',
            other,
        })
    }

    draw() {

        const {
            ctx,
            x,
            y,
            r,          // circle radius
            radius,     // poisson-disc radius
            status,
        } = this

        if (status === 'active') {

            ctx.fillStyle = 'red'
            ctx.beginPath()
            ctx.circle(0, 0, r)
            ctx.fill()

        } else if (status === 'currentActive') {

            ctx.fillStyle = 'red'
            ctx.beginPath()
            ctx.circle(0, 0, r)
            ctx.fill()

            ctx.fillStyle = '#0003'
            ctx.beginPath()
            ctx.ring(0, 0, radius, radius * 2)
            ctx.fill('evenodd')

        } else if (/candidate/.test(status)) {

            ctx.strokeStyle = 'black'
            ctx.fillStyle = 'white'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.circle(0, 0, r)
            ctx.fill()
            ctx.stroke()

            if (/linked/.test(status)) {

                const { other } = this
                const dx = other.x - x
                const dy = other.y - y
                ctx.moveTo(0, 0)
                ctx.lineTo(dx, dy)
                ctx.stroke()
            }

        } else {

            ctx.fillStyle = 'black'
            ctx.beginPath()
            ctx.circle(0, 0, r)
            ctx.fill()
        }
    }
}