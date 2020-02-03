import {
    Renderer,
    Camera,
    Program,
    Mesh,
    Sphere,
    Box,
    Plane,
    Color,
    Orbit,
    Vec3,
} from '../../lib/ogl/index.mjs'

import utils from './utils.js'
import setup from './setup.js'
import kit from './kit.module.js'



async function main() {

    const { gl, camera, renderer, scene, raycast, mouse, onUpdate } = setup({ size:3 })

    const orbit = new Orbit(camera)
    onUpdate.add(() => orbit.update())

    const sphere = new Mesh(gl, {
        geometry: new Sphere(gl),
        program: new Program(gl, {
            vertex: await utils.load('materials/color/vertex.glsl'),
            fragment: await utils.load('materials/color/fragment.glsl'),
            uniforms: { uColor: { value:new Color('#fc0') }},
        }),
    })
    sphere.setParent(scene)

}

main()

Object.assign(window, {
    utils,
    kit,
    Color,
    Vec3,
})
