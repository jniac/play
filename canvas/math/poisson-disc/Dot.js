import { CanvasElement } from './canvas-engine.js'
import Point from './Point.js'

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
            r,          // circle radius
            radius,     // poisson-disc radius
            status,
            completion,
        } = this

        // if current draw ring
        if (/current/.test(status)) {

            ctx.fillStyle = '#0003'
            ctx.beginPath()
            ctx.ring(0, 0, radius, radius * 2)
            ctx.fill('evenodd')
        }

        if (/active/.test(status)) {

            ctx.fillStyle = 'red'
            ctx.beginPath()
            ctx.circle(0, 0, r)
            ctx.fill()

        } else if (/new/.test(status)) {

            ctx.fillStyle = '#06f'
            ctx.beginPath()
            ctx.circle(0, 0, r)
            ctx.fill()

            ctx.strokeStyle = '#06f'
            ctx.lineWidth = 4
            ctx.beginPath()
            ctx.circle(0, 0, 16)
            ctx.stroke()

        } else if (/candidate/.test(status)) {

            ctx.strokeStyle = 'black'
            ctx.fillStyle = 'white'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.circle(0, 0, r)
            ctx.fill()
            ctx.stroke()

            if (/linked/.test(status)) {

                const { x, y, other } = this
                let d = new Point(other.x - x, other.y - y)
                d.norm += -12

                ctx.moveTo(0, 0)
                ctx.lineTo(d.x, d.y)
                ctx.stroke()
            }

        } else {

            ctx.fillStyle = 'black'
            ctx.beginPath()
            ctx.circle(0, 0, r)
            ctx.fill()
        }

        if (completion) {

            ctx.strokeStyle = /active/.test(status) ? 'red' : 'black'
            ctx.lineWidth = 4
            ctx.beginPath()
            ctx.arc(0, 0, 16, 0, 2 * Math.PI * completion)
            ctx.stroke()
        }
    }
}
