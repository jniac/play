import {
    Renderer,
    Camera,
    Program,
    Mesh,
    Geometry,
    Sphere,
    Box,
    Plane,
    Color,
    Orbit,
    Vec3,
} from '../lib/ogl/index.mjs'

import utils from '../lib/utils.js'
import setup from '../lib/ogl-setup.js'
import kit from '../lib/kit.module.js'

async function main() {

    const { gl, camera, renderer, scene, raycast, mouse, onUpdate } = setup({ size:3 })

    camera.position.set(-4.06, -5.49, 8.76)

    const orbit = new Orbit(camera)
    onUpdate.add(() => orbit.update())

    const sphere = new Mesh(gl, {
        geometry: new Sphere(gl),
        program: new Program(gl, {
            vertex: await utils.load('../materials/color/vertex.glsl'),
            fragment: await utils.load('../materials/color/fragment.glsl'),
            uniforms: { uColor: { value:new Color('#fc0') }},
        }),
    })
    // sphere.setParent(scene)



    let rMin = .5, rMax = 2
    let n = 160
    const positions = []
    const normals = []
    const uvs = []
    const indices = []
    const aMax = 4 * Math.PI
    for (let i of utils.enumerate(n + 1)) {

        const a = aMax * i / n
        const cos = Math.cos(a), sin = Math.sin(a)
        positions.push(rMin * cos, rMin * sin, i/n*2)
        positions.push(rMax * cos, rMax * sin, i/n*2)
        normals.push(0, 0, -1)
        normals.push(0, 0, -1)
        uvs.push(i / n, 0)
        uvs.push(i / n, 1)

        if (i > 0) {
            const p = (i - 1) * 2
            indices.push(p + 0, p + 1, p + 2)
            indices.push(p + 1, p + 3, p + 2)
        }
    }

    const attributes = {
        position: { size:3, data:new Float32Array(positions) },
        normal: { size: 3, data: new Float32Array(normals) },
        uv: { size: 2, data:new Float32Array(uvs) },
        index: { data:(positions.length / 3 > 65536) ? new Uint32Array(indices) : new Uint16Array(indices) },
    }

    const lol = new Mesh(gl, {
        geometry: new Geometry(gl, attributes),
        program: new Program(gl, {
            vertex: await utils.load('../materials/uv/vertex.glsl'),
            // fragment: await utils.load('../materials/uv/fragment.glsl'),
            fragment: await utils.load('../materials/uv/gradient-u.glsl'),
            uniforms: {
                uColor0: { value:new Color('#fc0') },
                uColor1: { value:new Color('#0cf') },
            },
            cullFace: false,
        }),
    })
    lol.setParent(scene)

}

main()

Object.assign(window, {
    utils,
    kit,
    Color,
    Vec3,
})
