import {
  View,
  Text,
  StyleSheet,
  PixelRatio,
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';
import Component from 'GKComponent';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from 'GKColors';
import fonts from 'GKFonts';
import ImageCopperView from './image-cropper-view';

export default class PhotoEdit extends Component {

  constructor() {
    super();
    this.state = {
      image : 'test3.jpg'
    };
  }

  componentDidMount() {
    return;
    var e = 0;
    var a = setInterval(() => {
      e++;
      this.setState({
        image : this.state.image === 'test.jpg' ? 'test3.jpg' : 'test.jpg'
      });
      if(e === 2){
      //  clearInterval(a);
      }
    }, 3000);
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageCopperView
          magnification={2.0}
          window={this.props.window}
          ref={'cropper'}
          image={this.state.image}
          ></ImageCopperView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor : 'white',
    flex : 1,
    alignItems : 'center',
    paddingTop : 33
  },
  photo : {
    width : 280,
    height : 280
  }
});
