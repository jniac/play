import { Mesh, Plane, Vec3, Program } from './ogl/index.mjs'
import utils from './utils.js'
import kit from './kit.module.js'

const vertex = /* glsl */ `
    precision highp float;
    precision highp int;
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform mat3 normalMatrix;
    varying vec3 vNormal;
    varying vec2 vUv;
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragment = /* glsl */ `
    precision highp float;
    precision highp int;
    varying vec3 vNormal;
    varying vec2 vUv;
    uniform vec3 uColor;
    uniform float uAlpha;
    void main() {
        vec2 p = vec2(.5, .5) - vUv;
        vec3 normal = normalize(vNormal);
        float lighting = dot(normal, normalize(vec3(-0.3, 0.8, 0.6)));
        // gl_FragColor.rgb = (uColor + lighting * 0.1) * uAlpha;
        gl_FragColor.rgb = (uColor + lighting * 0.1);
        float d = length(p) * 2.;
        gl_FragColor.a = (1. - smoothstep(.99, 1., d)) * uAlpha;
        if (gl_FragColor.a < 0.01) discard;
    }
`;

const pooow = x => x < 0 || x > 1 ? 0 : (1 - x ** (x * 7.5)) * 1.07
// const pooow = x => x < 0 || x > 1 ? 0 : (1 - x ** (x * 5)) * 1.19

export default ({ scene, gl, focus = new Vec3(0, 0, -10), color = new Color('#fc0') }) => {

    const program = new Program(gl, {
        vertex,
        fragment,
        cullFace: null,
        transparent: true,
        uniforms: {
            uColor: { value:new Color() },
            uAlpha: { value:1 },
        },
    })

    let dt = 1 / 60

    const particles = new Set()

    const create = ({ size = .01, respawnOnDeath, dispersionMax = 1, dispersionMin = .8, deltaZ = .05 } = {}) => {

        const mesh = new Mesh(gl, { geometry:new Plane(gl, { width:size, height:size }), program })
        mesh.setParent(scene)

        let v = new Vec3(), c = new Color().copy(color)
        let t, tmax, easeT1, drag, scale, dead = true

        const init = () => {

            t = 0
            tmax = kit.Random.float(.8, 1.3)
            drag = kit.Random.float(.3, .4) ** dt

            let a = kit.Random.float(2 * Math.PI)
            let vLength = kit.Random.float(.1, .3)
            v.x = vLength * Math.cos(a)
            v.y = vLength * Math.sin(a)

            let d = dispersionMin + (dispersionMax - dispersionMin) * (kit.Random.float() ** .5)
            mesh.position.x = focus.x + d * Math.cos(a)
            mesh.position.y = focus.y + d * Math.sin(a)
            mesh.position.z = focus.z + deltaZ

            // scale = kit.Random.float(.5, 1)
            scale = 1

            c.copy(color)

            dead = false

        }

        mesh.scale.set(0)

        init()

        const update = () => {

            if (dead)
                return

            t += dt
            v.x *= drag
            v.y *= drag
            mesh.position.x += v.x * dt
            mesh.position.y += v.y * dt
            easeT1 = pooow(t / tmax)
            // mesh.scale.set(scale)
            mesh.scale.set(scale * easeT1)
            dead = t > tmax

            if (dead)
                init()

        }

        mesh.onBeforeRender(() => {
            mesh.program.uniforms.uColor.value.copy(c)
            mesh.program.uniforms.uAlpha.value = easeT1
        })

        return { mesh, init, update }

    }

    let s1 = new Set()
    let s2 = new Set()

    for (let i of utils.enumerate({ max:300 }))
        s1.add(create({ respawnOnDeath:false, deltaZ:-.05 }))

    for (let i of utils.enumerate({ max:100 }))
        s2.add(create({ respawnOnDeath:false, dispersionMin:0, deltaZ:.05 }))

    const update = () => {

        for (let p of s1)
            p.update()

        for (let p of s2)
            p.update()

    }

    return {
        focus,
        color,
        update,
    }



}
