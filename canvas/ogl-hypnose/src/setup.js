import { Renderer, Camera, Raycast, Transform, Vec2 } from './ogl/index.mjs'

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
document.querySelector('.button.refresh').onclick = () => window.location.href = '#' + Math.floor(2147483647 * Math.random())
document.querySelector('.button.fullscreen').onclick = () => toggleFullScreen()

document.onfullscreenchange = () => document.body.classList.toggle('is-fullscreen', document.fullscreenElement)

document.body.classList.toggle('hidden-ui', window.location.search.includes('hidden-ui=1'))

// weird bug with fullscreen
document.documentElement.scrollTop = 0

export default function setup({ size = 2 } = {}) {

    const renderer = new Renderer({ dpr:2 })
    const gl = renderer.gl
    document.body.appendChild(gl.canvas)
    gl.clearColor(0, 0, 0, 1)

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

        // camera.perspective({ aspect })

        const y = size / 2
        const x = y * aspect
        camera.orthographic({ left:-x, right:x, top:y, bottom:-y })
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

    document.addEventListener('mousemove', move, false);
    document.addEventListener('touchmove', move, false);

    window.addEventListener('resize', resize, false)

    resize()

    return { gl, camera, renderer, scene, raycast, mouse }

}
