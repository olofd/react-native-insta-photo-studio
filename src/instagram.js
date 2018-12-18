import {
  AppRegistry,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  View,
  ScrollView,
  Slider
} from 'react-native';
import React from 'react';
import GL from 'gl-react';
import TestImage from './test-media/test.jpg';
import FilterSeventySeven from './filters/1977';
import Normal from './filters/normal';
import Multi from './filters/multi';
import App from './effects/App';
import { Surface, resolveAssetSource } from 'gl-react-native';
import RNPhotosFramework from '../react-native-photos-framework';



console.log(resolveAssetSource(TestImage));

var {
  width,
  height
} = Dimensions.get('window');
var rn_instagram = React.createClass({
  getInitialState: function () {
    return {
      width: 100,
      height: 100,
      saturation: 1,
      brightness: 1,
      contrast: 1,
      hue: 0,
      sepia: 0,
      gray: 0,
      mixFactor: 0
    };
  },
  renderWithDimensions: function (layout) {
    var {
      width,
      height
    } = layout.nativeEvent.layout;
    this.setState({
      width,
      height
    })
  },
  componentWillMount() {
    RNPhotosFramework.getAssets().then((data) => {
      this.setState({
        image : data.assets[3].image
      });
    });
  },
  /*
  saturation={this.state.saturation}
  contrast={this.state.contrast}
  hue={this.state.hue}
  gray={this.state.gray}
  sepia={this.state.sepia}
  mixFactor={this.state.mixFactor}
  width={this.state.width}
  height={this.state.height}
  image='https://upload.wikimedia.org/wikipedia/commons/b/b4/JPEG_example_JPG_RIP_100.jpg'
  */
  getImage: function () {
    if(!this.state.image) {
      return null;
    }
    return (
      <Surface width={280} height={280}>
        <Instagram
          brightness={this.state.brightness}
          saturation={this.state.saturation}
          contrast={this.state.contrast}
          hue={this.state.hue}
          gray={this.state.gray}
          sepia={this.state.sepia}
          mixFactor={this.state.mixFactor}
          width={this.state.width}
          height={this.state.height}
          image={this.state.image}
        ></Instagram>
      </Surface>

    )
  },

  /*
  <AnyInsta
    width={this.state.width}
    height={this.state.height}
    shader={FilterSeventySeven}
    inputImageTexture='test.jpg'
    inputImageTexture2='filter2.png'
    inputImageTexture3='valenciaGradientMap.png'
  ></AnyInsta>

  <Instagram
    brightness={this.state.brightness}
    saturation={this.state.saturation}
    contrast={this.state.contrast}
    hue={this.state.hue}
    gray={this.state.gray}
    sepia={this.state.sepia}
    mixFactor={this.state.mixFactor}
    width={this.state.width}
    height={this.state.height}
    image='https://upload.wikimedia.org/wikipedia/commons/b/b4/JPEG_example_JPG_RIP_100.jpg'
    ></Instagram>

  <AnyInsta
    position={0}
    width={this.state.width}
    height={this.state.height}
    shader={FilterSeventySeven}
    inputImageTexture='test.jpg'
    inputImageTexture2='valenciaMap.png'
    inputImageTexture3='valenciaGradientMap.png'
  >
  */
  render: function () {
    return (
      <View style={styles.container}>
        <View style={styles.container} onLayout={this.renderWithDimensions}>
          {this.state.width ? this.getImage() : null}
        </View>
        <ScrollView style={styles.container}>
          <View>
            <Text>Blend Factor: {this.state.mixFactor}</Text>
            <Slider
              value={this.state.mixFactor}
              minimumValue={0}
              maximumValue={2}
              onValueChange={(mixFactor) => this.setState({ mixFactor })}
            />
          </View>
          <View>
            <Text>Brightness: {this.state.brightness}</Text>
            <Slider
              value={this.state.brightness}
              minimumValue={0}
              maximumValue={3}
              onValueChange={(brightness) => this.setState({ brightness })}
            />
          </View>
          <View>
            <Text>Saturation: {this.state.saturation}</Text>
            <Slider
              value={this.state.saturation}
              minimumValue={0}
              maximumValue={3}
              onValueChange={(saturation) => this.setState({ saturation })}
            />
          </View>
          <View>
            <Text>Contrast: {this.state.contrast}</Text>
            <Slider
              value={this.state.contrast}
              minimumValue={0}
              maximumValue={3}
              onValueChange={(contrast) => this.setState({ contrast })}
            />
          </View>
          <View>
            <Text>Sepia: {this.state.sepia}</Text>
            <Slider
              value={this.state.sepia}
              minimumValue={0}
              maximumValue={1}
              onValueChange={(sepia) => this.setState({ sepia })}
            />
          </View>
          <View>
            <Text>Grayscale: {this.state.gray}</Text>
            <Slider
              value={this.state.gray}
              minimumValue={0}
              maximumValue={1}
              onValueChange={(gray) => this.setState({ gray })}
            />
          </View>
          <View>
            <Text>Hue: {this.state.hue}</Text>
            <Slider
              value={this.state.hue}
              minimumValue={0}
              maximumValue={10}
              onValueChange={(hue) => this.setState({ hue })}
            />
          </View>
        </ScrollView>
      </View>
    );
  }
});
var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  cover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});
console.log(GL);
const shaders = GL.Shaders.create({
  instagram: Multi
});

module.exports = rn_instagram;


var AnyInsta = GL.createComponent(
  ({ shader, inputImageTexture, inputImageTexture2, inputImageTexture3, ...rest }) =>
    <GL.Node
      {...rest}
      inputTextureCoordinate={[
        -1.0, -1.0,
        1.0, -1.0,
        -1.0, 1.0,
        1.0, 1.0,
      ]}
      shader={shader}
      uniforms={{ 'u_Texture0': inputImageTexture, 'u_Texture1': inputImageTexture2 }}>
    </GL.Node>
  , { displayName: "Any" });

var Instagram = GL.createComponent(
  ({ brightness, saturation, contrast, hue, gray, sepia, mixFactor, image, children, ...rest }) =>
    <GL.Node
      {...rest}
      shader={shaders.instagram}
      uniforms={{ brightness, saturation, contrast, hue, gray, sepia, mixFactor, tex: image }}>
    </GL.Node>
  , { displayName: "Instagram" });
