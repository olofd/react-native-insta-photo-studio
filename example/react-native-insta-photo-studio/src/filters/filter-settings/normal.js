export default {
  name : 'Normal',
  settings : {
    blur: 0,
    saturation: 1,
    contrast: 1,
    brightness: 1,
    negative: 0,
    hue: 0,
    sepia: 0,
    flyeye: 0,
    mixColorPalette: [
      // one way to do Sepia: grayscale & use alpha channel to add red & remove blue
      1, 0, 0, 0,
      0, 0.95, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ],
    colorAmount: 1.0
  }
};
