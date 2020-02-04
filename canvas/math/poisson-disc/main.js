import engine, { Grid, Circle, onDraw, time, width, height, wait } from './canvas-engine.js'
import Dot from './Dot.js'
import kit from '../../lib/kit.module.js'

const R = new kit.Random(1234567)

const randomPointInAnnulus = (x, y, rMin, rMax, random) => {

    const rMin2 = rMin * rMin
    const rDelta2 = rMax * rMax - rMin2
    const r = Math.sqrt(rMin2 + rDelta2 * random())
    const a = 2 * Math.PI * random()

    x += r * Math.cos(a)
    y += r * Math.sin(a)

    return { x, y }
}

const k = 30
const radius = 100
const cellSize = radius * Math.SQRT1_2
const gridWidth = Math.floor(width / cellSize)
const gridHeight = Math.floor(height / cellSize)

let samples = new Map()

function* range(min, max) { while(min < max) yield min++ }

const registerSample = ({ x, y }) => {

    const cx = Math.floor(x / cellSize)
    const cy = Math.floor(y / cellSize)
    const index = cy * gridWidth + cx
    samples.set(index, { x, y })
}

const getCloseSample = ({ x, y }) => {

    let cx = Math.floor(x / cellSize)
    let cy = Math.floor(y / cellSize)
    const xMin = Math.max(cx - 2, 0)
    const xMax = Math.min(cx + 3, gridWidth)
    const yMin = Math.max(cy - 2, 0)
    const yMax = Math.min(cy + 3, gridHeight)

    for (let cy of range(yMin, yMax)) {

        for (let cx of range(xMin, xMax)) {

            const index = cy * gridWidth + cx
            const sample = samples.get(index)

            if (sample) {

                const dx = x - sample.x
                const dy = y - sample.y

                // NOTE: for clarity purpose: radius2 is not saved here
                // but should be in optimization
                if (dx * dx + dy * dy < radius * radius)
                    return sample
            }
        }
    }

    return null
}



// animation props
let pauseOnStep = true
let delaySamples = 20
let delayCandidates = 5





let activeSamples = []

const newSample = async () => {

    await wait(delaySamples * 1 / 60)

    if (activeSamples.length === 0)
        return

    let currentActive = activeSamples[Math.floor(activeSamples.length * R.float())]

    currentActive.status = 'currentActive'
    await wait(delaySamples * 1 / 60)

    let sample, candidates = new Set()

    for (let i of range(0, k)) {

        if (i > 0 && delayCandidates > 0)
            await wait(delayCandidates * 1 / 60)

        let { x, y } = randomPointInAnnulus(currentActive.x, currentActive.y, radius, radius * 2, () => R.float())

        // ignore outside candidate
        if (x < 0 || x > gridWidth * cellSize || y < 0 || y > gridHeight * cellSize)
            continue

        let candidate = new Dot({ x, y, status:'candidate', radius })
        candidates.add(candidate)

        let closeSample = getCloseSample({ x, y })

        if (!closeSample) {

            registerSample(candidate)
            activeSamples.push(candidate)
            sample = candidate

            break

        } else {

            candidate.link(closeSample)

        }

    }

    await wait(delaySamples * 1 / 60)

    for (let candidate of candidates)
        if (candidate !== sample)
            candidate.kill()

    if (sample) {

        currentActive.status = 'active'
        sample.status = 'active'

    } else {

        currentActive.status = 'done'
        const index = activeSamples.indexOf(currentActive)
        activeSamples.splice(index, 1)
    }
}





let g = new Grid({ step:cellSize, col:gridWidth, row:gridHeight })

let p = new Dot({
    x: R.float(width),
    y: R.float(height),
    radius,
})

activeSamples.push(p)
registerSample(p)

const main = async () => {

    while (true) {

        await newSample()
    }
}

main()

document.querySelector('#samples input').value = delaySamples
document.querySelector('#samples input').oninput = e => delaySamples = parseFloat(e.target.value)
document.querySelector('#candidates input').value = delayCandidates
document.querySelector('#candidates input').oninput = e => delayCandidates = parseFloat(e.target.value)



Object.assign(window, {
    Dot,
    engine,
    samples,
    activeSamples,
    p,
    getCloseSample,
    wait,
})
