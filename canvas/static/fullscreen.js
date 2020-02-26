window.addEventListener('load', () => {

    const style = document.createElement('style')
    style.innerHTML = `
        body:not(.hidden-ui) div.fullscreen {
            position: absolute;
            width: 32px;
            height: 32px;
            background-color: #ccc;
            user-select: none;
            cursor: pointer;
            transition: .1s;
            background-size: cover;
            top: 12px;
            right: 12px;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'%3E%3Cpath d='M4.5 11H3v4h4v-1.5H4.5V11zM3 7h1.5V4.5H7V3H3v4zm10.5 6.5H11V15h4v-4h-1.5v2.5zM11 3v1.5h2.5V7H15V3h-4z'/%3E%3C/svg%3E");
        }
    `
    document.head.append(style)

    const div = document.createElement('div')
    div.classList.add('button', 'fullscreen')
    document.body.append(div)



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
    document.querySelector('.button.fullscreen').onclick = () => toggleFullScreen()

    document.onfullscreenchange = () => document.body.classList.toggle('is-fullscreen', document.fullscreenElement)

    // weird bug with fullscreen
    document.documentElement.scrollTop = 0

    document.body.classList.toggle('hidden-ui', /hidden-ui=(true|1)/.test(window.location.search))
})
