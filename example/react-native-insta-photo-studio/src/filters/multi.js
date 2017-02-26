export default {
    frag: `
      precision highp float;
      varying vec2 uv;
      uniform sampler2D tex;
      uniform float saturation;
      uniform float brightness;
      uniform float contrast;
      uniform float hue;
      uniform float gray;
      uniform float sepia;
      uniform float mixFactor;
      const vec3 W = vec3(0.2125, 0.7154, 0.0721);
      const mat3 rgb2yiq = mat3(0.299, 0.587, 0.114, 0.595716, -0.274453, -0.321263, 0.211456, -0.522591, 0.311135);
      const mat3 yiq2rgb = mat3(1.0, 0.9563, 0.6210, 1.0, -0.2721, -0.6474, 1.0, -1.1070, 1.7046);
      const vec3 SEPIA = vec3(1.2, 1.0, 0.8);
      vec3 BrightnessContrastSaturation(vec3 color, float brt, float con, float sat)
      {
        vec3 black = vec3(0., 0., 0.);
        vec3 middle = vec3(0.5, 0.5, 0.5);
        float luminance = dot(color, W);
        vec3 gray = vec3(luminance, luminance, luminance);

        vec3 brtColor = mix(black, color, brt);
        vec3 conColor = mix(middle, brtColor, con);
        vec3 satColor = mix(gray, conColor, sat);
        return satColor;
      }
      vec3 multiplyBlender(vec3 Color, vec3 filter){
        vec3 filter_result;
        float luminance = dot(filter, W);

        if(luminance < 0.5)
          filter_result = 2. * filter * Color;
        else
          filter_result = Color;

        return filter_result;
      }
      vec3 ovelayBlender(vec3 Color, vec3 filter){
        vec3 filter_result;
        float luminance = dot(filter, W);

        if(luminance < 0.5)
          filter_result = 2. * filter * Color;
        else
          filter_result = 1. - (1. - (2. *(filter - 0.5)))*(1. - Color);

        return filter_result;
      }
      vec3 applyHue(vec3 Color, float h) {
        vec3 yColor = rgb2yiq * Color;
        float originalHue = atan(yColor.b, yColor.g);
        float finalHue = originalHue + (h);
        float chroma = sqrt(yColor.b*yColor.b+yColor.g*yColor.g);
        vec3 yFinalColor = vec3(yColor.r, chroma * cos(finalHue), chroma * sin(finalHue));
        return vec3(yiq2rgb*yFinalColor);
      }
      vec3 applyGray(vec3 Color, float g) {
        float gray = dot(Color, vec3(0.299, 0.587, 0.114));
        return mix(Color, vec3(gray, gray, gray), g);
      }
      vec3 applySepia(vec3 Color, float s) {
        float gray = dot(Color, vec3(0.299, 0.587, 0.114));
        return mix(Color, vec3(gray) * SEPIA, s);
      }
      void main() {
        vec2 st = uv.st;
        vec3 irgb = texture2D(tex, st).rgb;
        vec3 filter = texture2D(tex, st).rgb;
        vec3 bcs_result = BrightnessContrastSaturation(irgb, brightness, contrast, saturation);
        vec3 hue_result = applyHue(bcs_result, hue);
        vec3 sepia_result = applySepia(hue_result, sepia);
        vec3 gray_result = applyGray(sepia_result, gray);
        vec3 after_filter = mix(gray_result, multiplyBlender(gray_result, filter), mixFactor);

        gl_FragColor = vec4(after_filter, 1.);
      }
    `
};
