
precision highp float;
precision highp int;
varying vec3 vNormal;
varying vec2 vUv;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform float offset;

void main() {
    vec3 normal = normalize(vNormal);
    float lighting = dot(normal, normalize(vec3(-0.3, 0.8, 0.6)));
    float t = mod(vUv.x + offset, 1.);
    t *= t * t;
    gl_FragColor.rgb = mix(uColor0, uColor1, t) + lighting * 0.1;
    gl_FragColor.a = 1.0;
}
