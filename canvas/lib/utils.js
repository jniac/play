
function* enumerate({ min = 0, max, step = 1 }) {

    if (typeof arguments[0] === 'number')
        max = arguments[0]

    while (min < max) {
        yield min
        min += step
    }
}

function wait(delay) {

    return new Promise(resolve => setTimeout(resolve, delay * 1e3))

}

async function load(url) {

    let response = await fetch(url)

    return response.text()

}

export {
    wait,
    enumerate,
    load,
}

export default {
    wait,
    enumerate,
    load,
}
