import React, { Component } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
//import {Surface} from 'gl-react-native';
//import ImageEffects from '../effects/ImageEffects';
//import {CompositShader, MultiShader} from './shaders';
//import {Image as GLImage} from 'gl-react-image';

//const CurrentShader = CompositShader;

export default class FilteredImage extends Component {

  render() {
    const { width, height } = this.props;
    return (<View>
      <Image onLoad={this.props.onLoad} style={{width : width, height : height}} source={this.props.image}></Image>
    </View>); 
  }

  __render() {
    const { width, height } = this.props;
    return (
      <Surface onLoad={this.props.onLoad} pixelRatio={2} width={width} height={height} ref="cropit">
        <CurrentShader width={width} height={height} {...this.props.effects}>
          <GLImage
            source={this.props.image}
            imageSize={this.props.imageSize || { width, height }}
            resizeMode="contain"
          />
        </CurrentShader>
      </Surface>
    );
  }
}

const styles = StyleSheet.create({});
