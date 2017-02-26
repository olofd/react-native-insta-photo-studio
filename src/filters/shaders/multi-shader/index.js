import React from 'react';
import GL from 'gl-react';
import Shader from './shader';

const shaders = GL.Shaders.create({
  instagram: Shader
});
const component = GL.createComponent(
  ({ brightness = 1, saturation = 1, contrast = 1, hue = 0, gray = 0, sepia = 0, mixFactor = 1, children : tex, ...rest }) =>
  <GL.Node
    {...rest}
    shader={shaders.instagram}
    uniforms={{ brightness, saturation, contrast, hue, gray, sepia, mixFactor, tex }}>
  </GL.Node>
, { displayName: "Instagram" });
export default component;
