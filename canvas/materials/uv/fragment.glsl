
precision highp float;
precision highp int;
varying vec3 vNormal;
varying vec2 vUv;
void main() {
    vec3 normal = normalize(vNormal);
    float lighting = dot(normal, normalize(vec3(-0.3, 0.8, 0.6)));
    gl_FragColor.rgb = vec3(vUv, 1.0) + lighting * 0.1;
    gl_FragColor.a = 1.0;
}
