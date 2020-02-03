
precision highp float;
precision highp int;

varying vec2 vUv;

uniform float uTime;
uniform float uTimeOffset;
uniform vec3 uColor;
uniform float uStripe;
uniform float uRay;
uniform float uRatio;

const float PI = 3.141592653589793;

float easeInout(float x, float p) {

    return x < .5
        ? pow(2. * x, p) / 2.
        : 1. - pow(2. * (1. - x), p) / 2.;

}

float sawtooth(float x, float period) {

    x = mod(x, period);

    return x < period / 2.
        ? 2. * x / period
        : 2. * (1. - x / period);

}

void main() {

    vec2 p = vec2(.5, .5) - vUv;
    float d = length(p) * 2.;
    float a = atan(p.y, p.x);
    float x = sawtooth(d * uStripe - (uTime + uTimeOffset) * .08 * uStripe + a * uRay / PI / 2., 1.);

    float delta = .001 * uStripe;
    float wave = smoothstep(uRatio - delta, uRatio + delta, x);
    // gl_FragColor.rgb = uColor * wave * pow(clamp(vUv.y * 1.4 - .4, 0., 1.), .75);
    gl_FragColor.rgb = uColor * wave * pow(vUv.y, .75);
    gl_FragColor.a = 1. - smoothstep(.99, 1., d);

    if (gl_FragColor.a < 0.01)
        discard;

}
