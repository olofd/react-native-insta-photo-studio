export default {
    frag : `
    precision lowp float;

    varying highp vec2 uv;

    uniform sampler2D inputImageTexture;

    void main()
    {

        vec3 texel = texture2D(inputImageTexture, uv).rgb;

        gl_FragColor = vec4(texel, 1.0);
    }

    `
};
