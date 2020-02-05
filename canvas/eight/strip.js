import { Vec3, Mat4 } from '../lib/ogl/index.mjs'

const matrix = new Mat4()

const positions = []
const normals = []
const uvs = []
const indices = []
const uPositions = []

function* enumerate(max) {
    let i = 0
    while (i < max)
        yield i++
}

const position = (x, y, z) => new Vec3(x, y, z).applyMatrix4(matrix)
const normal = (x, y, z) => new Vec3(x, y, z).transformDirection(matrix)

const mixVec3 = (A, B, t) => {

    const it = 1 - t
    return new Vec3(
        A.x * it + B.x * t,
        A.y * it + B.y * t,
        A.z * it + B.z * t)
}

const props = {

    width: 1,
}

const state = {

    R: null, // current Right position
    L: null, // current Left position
    N: null, // current Normal
}

const arc = ({

    radius = 1.5,
    width = props.width,
    subdivision = 32,
    start = 0,
    arc = .5 * Math.PI,
    elevation = 0,

} = {}) => {

    const rMin = radius - width / 2
    const rMax = radius + width / 2

    const indicesOffset = positions.length / 3
    const uPositionOffset = uPositions.length === 0 ? 0 : uPositions[uPositions.length - 1]

    let R, L, N

    for (let i of enumerate(subdivision + 1)) {

        const t = i / subdivision
        const a = start + arc * t
        const cos = Math.cos(a), sin = Math.sin(a)
        R = position(rMin * cos, rMin * sin, t * elevation)
        L = position(rMax * cos, rMax * sin, t * elevation)
        N = normal(0, 0, -1)
        positions.push(...R)
        positions.push(...L)
        normals.push(...N)
        normals.push(...N)

        // real uvs position will be computed on dump
        uvs.push(0, 0)
        uvs.push(0, 1)

        const uPosition = uPositionOffset + Math.abs(arc) * radius * t
        uPositions.push(uPosition)

        if (i > 0) {
            const off = indicesOffset + (i - 1) * 2
            indices.push(off + 0, off + 1, off + 2)
            indices.push(off + 1, off + 3, off + 2)
        }
    }

    Object.assign(state, { R, L, N })
}

// NOTE: lineTo do not use matrix
const lineTo = (dest, {

    width = props.width,
    subdivision = 32,
    flipSide = false,

} = {}) => {

    const { R:originR, L:originL } = state
    const middle = originL.clone().add(originR).multiply(.5)
    const V = dest.clone().sub(middle)
    const Vlen = V.len()
    const U = new Vec3(-V.y, V.x, 0).normalize().multiply(width / 2)
    const destR = flipSide ? dest.clone().sub(U) : dest.clone().add(U)
    const destL = flipSide ? dest.clone().add(U) : dest.clone().sub(U)

    const indicesOffset = positions.length / 3
    const uPositionOffset = uPositions.length === 0 ? 0 : uPositions[uPositions.length - 1]

    let R, L, N

    for (let i of enumerate(subdivision + 1)) {

        const t = i / subdivision

        R = mixVec3(originR, destR, t)
        L = mixVec3(originL, destL, t)
        N = new Vec3(0, 0, -1)
        positions.push(...R)
        positions.push(...L)
        normals.push(...N)
        normals.push(...N)

        // real uvs position will be computed on dump
        uvs.push(0, 0)
        uvs.push(0, 1)

        const uPosition = uPositionOffset + Vlen * t
        uPositions.push(uPosition)

        if (i > 0) {
            const off = indicesOffset + (i - 1) * 2
            indices.push(off + 0, off + 1, off + 2)
            indices.push(off + 1, off + 3, off + 2)
        }
    }

    Object.assign(state, { R, L, N })
}

const dumpAttributes = () => {

    const uPositionMax = uPositions[uPositions.length - 1]
    for (let i of enumerate(uPositions.length)) {

        const u = uPositions[i] / uPositionMax
        uvs[i * 4 + 0] = u
        uvs[i * 4 + 2] = u
    }

    const attributes = {
        position: { size:3, data:new Float32Array(positions) },
        normal: { size:3, data:new Float32Array(normals) },
        uv: { size:2, data:new Float32Array(uvs) },
        index: { data:(positions.length / 3 > 65536) ? new Uint32Array(indices) : new Uint16Array(indices) },
    }

    matrix.identity()
    positions.length = 0
    normals.length = 0
    uvs.length = 0
    indices.length = 0

    return attributes
}

const bundle = {
    matrix,
    props,
    arc,
    lineTo,
    dumpAttributes,
}

export default bundle
