import { Renderer, Camera, Program, Mesh, Sphere, Box, Plane, Color, Orbit, Vec3 } from './ogl/index.mjs'
import utils from './utils.js'
import kit from './kit.module.js'
import setup from './setup.js'
import ParticlesSystem from './particlesSystem.js'

// const defaultSeed = 45686
// const defaultSeed = 535642245
// const defaultSeed = 713976386
// const defaultSeed = 1696274095
// const defaultSeed = 1728334641
// const defaultSeed = 1007973911
// const defaultSeed = 262850537
// const defaultSeed = 328409960
// const defaultSeed = 656829584
// const defaultSeed = 1952256520
// const defaultSeed = 1560169876
// const defaultSeed = 485327990
// const defaultSeed = 439213769
const defaultSeed = 1403029899
// const defaultSeed = 231667582 // dark

const seed = parseFloat(location.hash.slice(1)) || defaultSeed
const random = new kit.Random(seed)



window.onhashchange = () => location.reload()

async function main() {

    const vertex = await utils.load('src/vertex.glsl')
    const fragment = await utils.load('src/fragment.glsl')

    const { gl, camera, renderer, scene, raycast, mouse } = setup({ size:3 })

    // const pSystem = ParticlesSystem({ scene, gl })

    const orbit = new Orbit(camera)

    const planeGeometry = new Plane(gl)

    const spacing = 1
    const col = 9
    const row = 7

    let currentCircle

    const circles = [...utils.enumerate({ max:col * row })].map(i => {

        const hex = random.item([
            '#fc0',
            '#50408E',
            '#201B63',
            // '#204E3C',
            '#123c42',
        ])

        const offset = random.float()

        const [stripe, ray, ratio] = random.item([
            [  3,  0,  .7  ],
            [  3,  0,  .7  ],
            [  3,  0,  .7  ],
            [ 16,  1,  .8  ],
            [  1, 16,  .5  ],
        ])

        const program = new Program(gl, {
            vertex,
            fragment,
            transparent: true,
            uniforms: {
                uTime: { value:0 },
                uTimeOffset: { value:offset },
                uColor: { value:new Color(hex) },
                uRatio: { value:ratio },
                uStripe: { value:stripe },
                uRay: { value:ray },
            },
        })

        let x = i % col
        let y = Math.floor(i / col)

        if (y % 2)
            x += .5

        x += -(col - 1) / 2
        y += -(row - 1) / 2

        x += random.float(.25)
        let dy = random.float()
        y += dy * .25

        x *= spacing
        y *= spacing

        let circle = new Mesh(gl, { program, geometry:planeGeometry })
        circle.index = i
        circle.setParent(scene)
        circle.raycastPredicate = circle => {
            const { hit } = circle
            return hit.localPoint.len() <= .5
        }
        const anchor = new Vec3(x, y, -y * 2 - dy)
        const scale = 1, overScale = 1.7 + random.float(.15)
        circle.props = { scale, overScale, anchor, hex }
        circle.onOver = () => currentCircle = circle
        circle.onOut = () => currentCircle = null
        circle.position.copy(anchor)

        circle.update = t => {

            circle.program.uniforms.uTime.value = t * 1e-3

            let { scale, overScale, anchor, hex } = circle.props
            let hover = circle === currentCircle

            scale += ((hover ? 1.1 : 1) - scale) * .1

            circle.scale.set(scale * overScale)

            let position = anchor.clone()

            if (currentCircle) {

                let v = currentCircle.props.anchor.clone().sub(anchor)
                let d = v.len()
                if (d > .1) {
                    v.normalize().multiply(-.1)
                    position.add(v)
                }

            }

            circle.position.x += (position.x - circle.position.x) * .1
            circle.position.y += (position.y - circle.position.y) * .1

            Object.assign(circle.props, { scale, hex })

        }

        return circle

    })

    requestAnimationFrame(update)

    function update(t) {

        requestAnimationFrame(update)
        orbit.update()

        if (currentCircle) {
            // pSystem.focus.set(currentCircle.position.x, currentCircle.position.y, currentCircle.position.z + .05)
            // pSystem.color.set(currentCircle.props.hex)
        }

        // pSystem.update()

        for (let circle of circles)
            circle.update(t)

        renderer.render({ scene, camera })
    }

    Object.assign(window, {
        scene,
        circles,
        raycast,
        mouse,
    })

}

main()

Object.assign(window, {
    utils,
    kit,
    Color,
    Vec3,
})
