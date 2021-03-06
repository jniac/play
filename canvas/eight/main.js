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

import strip from './strip.js'

async function main() {

    const { gl, camera, renderer, scene, raycast, mouse, onUpdate } = setup({
        size:3,
        clearColor: new Color(.95, .95, .95),
    })

    // camera.position.set(-3.40, -4.84, 9.40)
    camera.position.set(0, 0, 10)

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



    let rMin = .75, rMax = 2
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

    // const attributes = {
    //     position: { size:3, data:new Float32Array(positions) },
    //     normal: { size: 3, data: new Float32Array(normals) },
    //     uv: { size: 2, data:new Float32Array(uvs) },
    //     index: { data:(positions.length / 3 > 65536) ? new Uint32Array(indices) : new Uint16Array(indices) },
    // }

    const elevation = .1
    strip.props.width = 2
    strip.matrix.translate([-1.5, 1.5, 0])
    strip.arc({ arc:1.5 * Math.PI, subdivision:90, start:0, elevation:elevation })
    strip.lineTo(new Vec3(1.5, 0, elevation))
    strip.matrix.identity()
    strip.matrix.translate([1.5, -1.5, elevation])
    strip.arc({ arc:-1.5 * Math.PI, subdivision:90, start:.5 * Math.PI, elevation:-elevation })
    strip.lineTo(new Vec3(0, 1.5, 0), { flipSide:true })
    const attributes = strip.dumpAttributes()

    const lol = new Mesh(gl, {
        geometry: new Geometry(gl, attributes),
        program: new Program(gl, {
            vertex: await utils.load('../materials/uv/vertex.glsl'),
            // fragment: await utils.load('../materials/uv/fragment.glsl'),
            fragment: await utils.load('../materials/uv/gradient-u.glsl'),
            uniforms: {
                uColor0: { value:new Color('#001020') },
                uColor1: { value:new Color('#fff') },
                offset: { value:0 },
            },
            cullFace: false,
        }),
    })
    lol.rotation.z = Math.PI * .25
    lol.setParent(scene)
    lol.onBeforeRender(({ mesh }) => mesh.program.uniforms.offset.value += -.1/60)

}

main()

Object.assign(window, {
    utils,
    kit,
    Color,
    Vec3,
})
