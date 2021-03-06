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

const k = 30                                            // max number of iteration by sample
const radius = 100                                      // minimum distance between 2 samples
const cellSize = radius * Math.SQRT1_2                  // cell size of the grid (to avoid global evaluation)
const gridWidth = Math.floor(width / cellSize)
const gridHeight = Math.floor(height / cellSize)

// the samples stored by their grid index (y * gridWidth + x)
let samples = new Map()

// usage: for (let i of range(min, max))
// max is not included
function* range(min, max) { while(min < max) yield min++ }

const registerSample = ({ x, y }) => {

    const cx = Math.floor(x / cellSize)
    const cy = Math.floor(y / cellSize)
    const index = cy * gridWidth + cx
    samples.set(index, { x, y })
}

// search for an existing sample stored in samples
// fast lookup via grid x/y iteration
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
let samplePause = false
let sampleDelay = 20
let candidatePause = false
let candidateDelay = 5

const sampleAnimation = async (doPause = true) => {

    if (sampleDelay > 0)
        await wait(sampleDelay * 1 / 60)

    if (samplePause && doPause) {
        engine.paused = true
        document.querySelector('button#play').innerHTML = "Play"
        await wait(0)
    }
}

const candidateAnimation = async () => {

    if (candidateDelay > 0)
        await wait(candidateDelay * 1 / 60)

    if (candidatePause) {
        engine.paused = true
        document.querySelector('button#play').innerHTML = "Play"
        await wait(0)
    }
}



let activeSamples = []

const newSample = async () => {

    await wait(0)

    await sampleAnimation()

    if (activeSamples.length === 0)
        return

    // pick a random sample
    let currentActive = activeSamples[Math.floor(activeSamples.length * R.float())]

    currentActive.status = 'active-current'

    await wait(0)

    await sampleAnimation()

    let sample, candidates = new Set()

    for (let i of range(0, k)) {

        await candidateAnimation()
        currentActive.completion = (i + 1) / k

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

    if (sample)
        sample.status = 'new'
    currentActive.status = sample ? 'active-current' : 'done-current'
    await sampleAnimation()
    currentActive.completion = 0

    for (let candidate of candidates)
        if (candidate !== sample)
            candidate.kill()

    if (sample) {

        sample.status = 'active'

    } else {

        // no close sample found
        // remove current sample from the activeSamples
        const index = activeSamples.indexOf(currentActive)
        activeSamples.splice(index, 1)
    }

    currentActive.status = sample ? 'active' : 'done'
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

document.querySelector('#samples input[type=range]').value = sampleDelay
document.querySelector('#samples input[type=range]').oninput = e => sampleDelay = parseFloat(e.target.value)
document.querySelector('#samples input[type=checkbox]').checked = samplePause
document.querySelector('#samples input[type=checkbox]').oninput = e => samplePause = e.target.checked
document.querySelector('#candidates input[type=range]').value = candidateDelay
document.querySelector('#candidates input[type=range]').oninput = e => candidateDelay = parseFloat(e.target.value)
document.querySelector('#candidates input[type=checkbox]').checked = candidatePause
document.querySelector('#candidates input[type=checkbox]').oninput = e => candidatePause = e.target.checked

document.querySelector('button#play').onclick = e => {
    engine.paused = !engine.paused
    e.target.innerHTML = engine.paused ? "Play" : "Pause"
}
document.querySelector('button#play').innerHTML = engine.paused ? "Play" : "Pause"





Object.assign(window, {
    Dot,
    engine,
    samples,
    activeSamples,
    p,
    getCloseSample,
    wait,
})
