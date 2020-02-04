import {
    Renderer,
    Camera,
    Raycast,
    Transform,
    Vec2,
    Vec3,
    Color,
} from './ogl/index.mjs'

Object.assign(window, {
    Vec2,
    Vec3,
    Color,
})

const requestFullscreen = (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen).bind(document.documentElement)
const exitFullscreen = (document.exitFullscreen || document.webkitExitFullscreen).bind(document)

function toggleFullScreen() {

    if (!document.fullscreenElement) {

        requestFullscreen()

    } else {

        exitFullscreen()

    }

}

window.addEventListener('keydown', e => e.code === 'Space' && toggleFullScreen())
document.querySelector('.button.refresh').onclick = () => window.location.href = '/#' + Math.floor(2147483647 * Math.random())
document.querySelector('.button.fullscreen').onclick = () => toggleFullScreen()

document.onfullscreenchange = () => document.body.classList.toggle('is-fullscreen', document.fullscreenElement)

// weird bug with fullscreen
document.documentElement.scrollTop = 0

export default function setup({
    size = 2,
    orthographic = false,
    clearColor = new Color(),
    clearColorAlpha = 1,
} = {}) {

    const onUpdate = new Set()

    const renderer = new Renderer({ dpr:2 })
    const gl = renderer.gl
    document.body.appendChild(gl.canvas)
    gl.clearColor(...clearColor, clearColorAlpha)

    const camera = new Camera(gl)
    camera.position.set(0, 0, 7)
    // camera.lookAt([0, 0, 0])

    const scene = new Transform()
    const raycast = new Raycast(gl)
    const mouse = new Vec2()

    function resize() {

        const { innerWidth:width, innerHeight:height } = window
        renderer.setSize(width, height)
        const aspect = gl.canvas.width / gl.canvas.height

        if (orthographic) {
            const y = size / 2
            const x = y * aspect
            camera.orthographic({ left:-x, right:x, top:y, bottom:-y })
        } else {
            camera.perspective({ aspect })
        }

    }

    let firstHit = null
    let hits = new Set()

    function move(e) {

        mouse.set(
            2.0 * (e.x / renderer.width) - 1.0,
            2.0 * (1.0 - e.y / renderer.height) - 1.0
        )

        raycast.castMouse(camera, mouse)

        const array = raycast
            .intersectBounds(scene.children)
            .filter(mesh => !mesh.raycastPredicate || mesh.raycastPredicate(mesh))

        const newHits = new Set(array)
        const [newFirstHit] = array

        for (let hit of hits)
            if (!newHits.has(hit))
                if (hit.onHitExit)
                    hit.onHitExit()

        for (let hit of newHits)
            if (!hits.has(hit))
                if (hit.onHitEnter)
                    hit.onHitEnter()

        if (firstHit !== newFirstHit) {

            if (firstHit)
                if (firstHit.onOut)
                    firstHit.onOut()

            firstHit = newFirstHit

            if (firstHit)
                if (firstHit.onOver)
                    firstHit.onOver()

        }

        for (let hit of newHits)
            if (hit.onMove)
                hit.onMove()

        hits = newHits

    }

    const update = t => {

        requestAnimationFrame(update)

        for (let cb of onUpdate)
            cb()

        renderer.render({ scene, camera })

    }

    // start
    document.addEventListener('mousemove', move, false);
    document.addEventListener('touchmove', move, false);
    window.addEventListener('resize', resize, false)
    resize()
    requestAnimationFrame(update)

    const bundle = { gl, camera, renderer, scene, raycast, mouse, onUpdate }
    Object.assign(window, bundle)
    return bundle

}
