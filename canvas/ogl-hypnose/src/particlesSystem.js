import { Mesh, Plane, Vec3, Program } from './ogl/index.mjs'
import utils from './utils.js'
import kit from './kit.module.js'

const { Random:R } = kit

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

    const create = ({
        size = .01,
        respawnOnDeath,
        deltaZ = .05,
        dispersionMax = 1,
        dispersionMin = .8,
        dispersionPower = .5,
    } = {}) => {

        const mesh = new Mesh(gl, { geometry:new Plane(gl, { width:size, height:size }), program })
        mesh.setParent(scene)

        let v = new Vec3(), c = new Color().copy(color)
        let t, tmax, easeT1, drag, scale, dead = true, respawnThreshold

        const spawn = () => {

            t = 0
            tmax = R.float(.8, 1.3)
            drag = R.float(.3, .4) ** dt

            let a = R.float(2 * Math.PI)
            let vLength = R.float(.1, .3)
            v.x = vLength * Math.cos(a)
            v.y = vLength * Math.sin(a)

            let d = dispersionMin + (dispersionMax - dispersionMin) * (R.float() ** dispersionPower)
            mesh.position.x = focus.x + d * Math.cos(a)
            mesh.position.y = focus.y + d * Math.sin(a)
            mesh.position.z = focus.z + deltaZ

            respawnThreshold = R.float(1, 2)

            // scale = R.float(.5, 1)
            scale = 1

            c.copy(color)

            dead = false
            fastKillEnabled = false

        }

        let fastKillEnabled = false
        const fastKill = () => {
            fastKillEnabled = true
        }

        mesh.scale.set(0)

        spawn()

        const update = () => {

            t += dt
            dead = t > tmax

            // if "fastKill" is enabled, tmax decrease, so living particles will
            // die faster (trigger when rollover change)
            if (fastKillEnabled)
                tmax += -dt

            // Do not respawn on death, but a wait an arbitrary amount of time
            // ([tmax, tmax * 2]), in order avoid "wave" effect (fastKill produce
            // such waves, via sudden death)
            if (dead && (t / tmax > respawnThreshold))
                spawn()

            if (dead)
                return

            v.x *= drag
            v.y *= drag
            mesh.position.x += v.x * dt
            mesh.position.y += v.y * dt
            easeT1 = pooow(t / tmax)
            // mesh.scale.set(scale)
            mesh.scale.set(scale * easeT1)

        }

        mesh.onBeforeRender(() => {
            mesh.program.uniforms.uColor.value.copy(c)
            mesh.program.uniforms.uAlpha.value = easeT1
        })

        return { mesh, spawn, update, fastKill }

    }

    let s1 = new Set()
    let s2 = new Set()

    for (let i of utils.enumerate({ max:200 }))
        s1.add(create({ respawnOnDeath:false, deltaZ:-.05 }))

    for (let i of utils.enumerate({ max:200 }))
        s2.add(create({ respawnOnDeath:false, dispersionMin:0, dispersionPower:1/4, deltaZ:.05 }))

    const update = () => {

        for (let p of s1)
            p.update()

        for (let p of s2)
            p.update()

    }

    const fastKill = () => {

        for (let p of s1)
            p.fastKill()

        for (let p of s2)
            p.fastKill()

    }

    return {
        focus,
        color,
        update,
        fastKill,
    }



}
