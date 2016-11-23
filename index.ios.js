import PhotoManager from './photo-manager';
import React, {Component} from 'react';
import photoFrameworkService from './services/camera-roll-service';
export default class InstaPhotoStudio extends Component {

  constructor() {
    super();
    this.state = {
      currentAlbum : null
    };
  }

  componentWillMount() {
    photoFrameworkService.getCurrentAlbum().then((currentAlbum) => {
      this.setState({
        currentAlbum : currentAlbum
      });
    });
  }

  render() {
    if(!this.state.currentAlbum) {
      return null;
    }
    return (
      <PhotoManager currentAlbum={this.state.currentAlbum}></PhotoManager>
    );
  }
}
