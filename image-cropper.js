import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View,
  Image,
  PanResponder,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  InteractionManager
} from 'react-native';
import ImageCropTool from 'react-native-image-crop';

import {Surface} from 'gl-react-native';
import ImageEffects from './effects/ImageEffects';

const {Image: GLImage} = require("gl-react-image");


const absoluteFill = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
};

export default class PhotoGrid extends Component {
  renderGrid = (direction) => {
    const blockStyle = direction === 'row'
      ? {borderColor: 'white', borderRightWidth: 1}
      : {borderColor: 'white', borderBottomWidth: 1};

    return (
      <View
        style={{
          ...absoluteFill,
          flexDirection: direction,
          opacity: 0.3,
        }}
      >
        <View style={[{flex: 1}, blockStyle]} />
        <View style={[{flex: 1}, blockStyle]} />
        <View style={{flex: 1}} />
      </View>
    );
  }

  render() {
    return (
      <View style={absoluteFill} pointerEvents="none">
        {this.renderGrid('row')}
        {this.renderGrid('column')}
      </View>
    );
  }
}

class ImageCrop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      zoom: 1,
      //pan settings
      centerX: 0.5,
      centerY: 0.5,
      //Image sizes
      imageHeight: 300,
      imageWidth: 300,
      currentCapture: '',
      imageReady : false,
      filter :  {
          blur: 0,
          saturation: 1.3,
          contrast: 1.0,
          brightness: 1.2,
          negative: 0,
          hue: 0,
          sepia: 0.40,
          flyeye: 0,
          mixColorPalette : [
            // one way to do Sepia: grayscale & use alpha channel to add red & remove blue
            1, 0, 0, 0,
            0, 0.95, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
          ],
          colorAmount : 1.0
        }
    };
  }
  componentWillMount(){
    var zoom = (100 - this.props.zoom)/100;
    this.setState({ zoom: zoom })

    this._panOffsetX= 0;
    this._panOffsetY= 0;
    this._panResponder = PanResponder.create({

      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onShouldBlockNativeResponder: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        //move variables
        this.offsetX = this.state.centerX;
        this.offsetY = this.state.centerY;

        //zoom variables
        this.zoomLastDistance=0;
        this.zoomCurrentDistance=0;
      },

      onPanResponderMove: (evt, gestureState) => {
        //We are moving the image
        console.log('ss')
        if (evt.nativeEvent.changedTouches.length <= 1){
          if (this.props.panToMove){
          /*  console.log(gestureState.dx);

            var trackX = (gestureState.dx/this.props.cropWidth)*this.state.zoom;
            var trackY = (gestureState.dy/this.props.cropHeight)*this.state.zoom;
            var newPosX = (Number(this.offsetX) - Number(trackX));
            var newPosY = (Number(this.offsetY) - Number(trackY));
            if (newPosX> 1) newPosX = Number(1);
            if (newPosY> 1) newPosY = Number(1);
            if (newPosX< 0) newPosX = Number(0);
            if (newPosY< 0) newPosY = Number(0);

            this.setState({centerX: newPosX})
            this._panOffsetX = gestureState.dx + this._panOffsetX;
            this._panOffsetY = gestureState.dy + this._panOffsetY;
            */
          }
        }else{
        //We are zooming the image
          if (this.props.pinchToZoom){
            //Pinch activated
            if (this.zoomLastDistance == 0){
              let a = evt.nativeEvent.changedTouches[0].locationX - evt.nativeEvent.changedTouches[1].locationX
              let b = evt.nativeEvent.changedTouches[0].locationY - evt.nativeEvent.changedTouches[1].locationY
              let c = Math.sqrt( a*a + b*b );
              this.zoomLastDistance = c.toFixed(1);
            }else{
              let a = evt.nativeEvent.changedTouches[0].locationX - evt.nativeEvent.changedTouches[1].locationX
              let b = evt.nativeEvent.changedTouches[0].locationY - evt.nativeEvent.changedTouches[1].locationY
              let c = Math.sqrt( a*a + b*b );
              this.zoomCurrentDistance = c.toFixed(1);

              //what is the zoom level
              var screenDiagonal = Math.sqrt(this.state.imageHeight*this.state.imageHeight + this.state.imageWidth*this.state.imageWidth);
              var distance = (this.zoomCurrentDistance-this.zoomLastDistance)/400;
              var zoom = this.state.zoom-distance;

              if (zoom<0.3)zoom=0.3;
              if (zoom>1)zoom=1;
              this.setState({
                zoom: zoom,
              })
              //Set last distance..
              this.zoomLastDistance=this.zoomCurrentDistance;
            }
          }
        }
      },
    });
    Image.getSize(this.props.image, (width, height) => {
      this.setState({
        imageHeight: height,
        imageWidth: width,
      });
    });
  }
  componentDidMount() {
    setTimeout(() => {

    }, 20);

  }
  setZoom() {
    this.scrollView.scrollResponderZoomTo({
      x: 1,
      y: 1,
      width: (2448 / 2),
      height: (2448 / 2),
      animated: false,
    });
    this.setState({imageReady : true})
  }
  componentWillReceiveProps(nextProps){
    if (this.props.zoom != nextProps.zoom) {
      var zoom = (100 - nextProps.zoom)/100;
      this.setState({ zoom: zoom });
    }
  }

  setFilter(num) {
    InteractionManager.runAfterInteractions(() => {
      this.setState({
        filter : {
          blur: 0,
          saturation: num === 1 ? 1.3 : 2.9,
          contrast: 1.0,
          brightness: 1.2,
          negative: 0,
          hue: 0,
          sepia: 0.40,
          flyeye: 0,
          mixColorPalette : [
            // one way to do Sepia: grayscale & use alpha channel to add red & remove blue
            1, 0, 0, 0,
            0, 0.95, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
          ],
          colorAmount : 1.0
        }
      })
    })

  }


  render() {

    const effects = {
      blur: 0,
      saturation: 1.3,
      contrast: 1.0,
      brightness: 1.2,
      negative: 0,
      hue: 0,
      sepia: 0.40,
      flyeye: 0,
      mixColorPalette : [
        // one way to do Sepia: grayscale & use alpha channel to add red & remove blue
        1, 0, 0, 0,
        0, 0.95, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ],
      colorAmount : 1.0
    };

    console.log(this.state.zoom);
    let multiZoomHeight = (400 / this.state.zoom) / (this.state.zoom < 1 ? this.state.zoom : 1);
    let multiZoomWidth = (300 / this.state.zoom)  / (this.state.zoom < 1 ? this.state.zoom : 1);
    let realSizeHeight = 3264 / 3;
    let realSizeWidth = 2448 / 3;
    return (
      <View>
        <PhotoGrid></PhotoGrid>
        <ActivityIndicator></ActivityIndicator>
      <View style={{height : 300, width : 300, overflow : 'hidden'}}>
        <ScrollView
          ref={scrollView => this.scrollView = scrollView}
          centerContent={true}
           maximumZoomScale={1.0}
           minimumZoomScale={0.19}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bouncesZoom={true}
          style={{height : 300, width : 300, backgroundColor : 'white'}}
          contentContainerStyle={{height : realSizeHeight, width : realSizeWidth, flex : 1}}
          alwaysBounceVertical={true}
          alwaysBounceHorizontal={true}>
          <Surface pixelRatio={2} width={realSizeWidth} height={realSizeHeight} ref="cropit">
          <ImageEffects width={realSizeWidth} height={realSizeHeight} {...this.state.filter}>

              <GLImage
                source={{ uri: this.props.image, height: realSizeHeight, width: realSizeWidth}}
                resizeMode="cover"
                zoom={this.state.zoom}
                center={[ this.state.centerX, this.state.centerY ]}
              />
            </ImageEffects>

          </Surface>
        </ScrollView>

      </View>
      <TouchableOpacity style={{width : 100, height : 50, backgroundColor : 'red'}} onPress={this.setFilter.bind(this, 1)}></TouchableOpacity>
      <TouchableOpacity style={{width : 100, height : 50, backgroundColor : 'red'}} onPress={this.setFilter.bind(this, 2)}></TouchableOpacity>

</View>


    );
  }
  crop(){
    return this.refs.cropit.captureFrame({quality: this.props.quality, type: this.props.type, format: this.props.format})
  }
}

/*
<View style={{height : 300, width : 300, overflow : 'hidden', opacity : this.state.imageReady ? 1 : 0}}>


</View>
<ScrollView
  ref={scrollView => this.scrollView = scrollView}
  centerContent={true}
   maximumZoomScale={0.6}
   minimumZoomScale={0.19}
  showsHorizontalScrollIndicator={false}
  showsVerticalScrollIndicator={false}
  bouncesZoom={true}
  style={{height : 300, width : 300, backgroundColor : 'white'}}
  contentContainerStyle={{height : 3264 / 2, width : 2448 / 2, flex : 1}}
  alwaysBounceVertical={true}
  alwaysBounceHorizontal={true}>
  <View style={{height : 3264 / 2, width : 2448 / 2, position : 'absolute'}}></View>
    <Image
      onLoad={() => this.setZoom()}
      source={{ uri: this.props.image, height: 3264 / 2, width: 2448 / 2}} resizeMode='cover'></Image>
</ScrollView>


<Surface width={2448 / 2} height={3264 / 2} ref="cropit">
<ImageEffects width={300} height={400} {...effects}>

    <GLImage
      source={{ uri: this.props.image, height: 3264, width: 2448}}
      resizeMode="cover"
      zoom={this.state.zoom}
      center={[ this.state.centerX, this.state.centerY ]}
    />
  </ImageEffects>

</Surface>
<View style={{width : 900, height : 700, backgroundColor : 'red', alignItems : 'center', justifyContent : 'center'}}>
  <View style={{width : 500, height : 500, backgroundColor : 'blue'}}>

  </View>
</View>
<Surface width={this.props.cropWidth} height={this.props.cropHeight} ref="cropit">
  <ImageEffects width={300} height={400} {...effects}>
    <GLImage
      source={{ uri: this.props.image, height: this.state.imageHeight, width: this.state.imageWidth}}
      resizeMode="cover"
      zoom={this.state.zoom}
      center={[ this.state.centerX, this.state.centerY ]}
    />
  </ImageEffects>
</Surface>
<View style={{height : 300, width : 300, overflow : 'hidden'}}>
  <ScrollView
    showsHorizontalScrollIndicator={false}
    showsVerticalScrollIndicator={false}
    bouncesZoom={true}
    style={{height : 300, width : 400}}
    contentContainerStyle={{height : 400, width : 200, flex : 1}}
    alwaysBounceVertical={true}
    alwaysBounceHorizontal={true}>
    <Surface width={this.props.cropWidth} height={this.props.cropHeight} ref="cropit">
      <ImageEffects width={300} height={400} {...effects}>
        <GLImage
          source={{ uri: this.props.image, height: this.state.imageHeight, width: this.state.imageWidth}}
          resizeMode="cover"
          zoom={this.state.zoom}
          center={[ this.state.centerX, this.state.centerY ]}
        />
      </ImageEffects>
    </Surface>
  </ScrollView>
</View>

<View style={{flex : 1}}>
  <ImageCropTool
      ref={(c) => { this.imageCropTool = c; }}
      cropWidth={500}
      cropHeight={500}
      source={{
          uri: 'test.jpg',
      }}
  />
</View>
*/
ImageCrop.defaultProps = {
  image: '',
  cropWidth: 300,
  cropHeight: 300,
  zoomFactor: 0,
  minZoom: 0,
  maxZoom: 100,
  quality: 1,
  type: 'jpg',
  format: 'base64',
}
ImageCrop.propTypes = {
  image: React.PropTypes.string.isRequired,
  cropWidth: React.PropTypes.number.isRequired,
  cropHeight: React.PropTypes.number.isRequired,
  zoomFactor: React.PropTypes.number,
  maxZoom: React.PropTypes.number,
  minZoom: React.PropTypes.number,
  quality: React.PropTypes.number,
  type: React.PropTypes.string,
  format: React.PropTypes.string,
}
module.exports=ImageCrop;
