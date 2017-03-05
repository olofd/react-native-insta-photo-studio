import React, {Component} from 'react';


export default class ToolBar extends Component {

  renderViewPortButton() {
    const {width, height} = this.state.currentImageDimensions;
    if (width === height) {
      return null;
    }
    return (
      <TouchableOpacity
        onPress={this.toogleViewportZoom.bind(this)}
        style={styles.zoomButtonContainer}>
        {/*We need a inner view to rotate. If we rotate the container, the border will look jagged*/}
        <View style={styles.zoomButtonRotationView}>
          <Icon style={styles.zoomButtonText} name='ios-arrow-up'></Icon>
          <Icon style={styles.zoomButtonText} name='ios-arrow-down'></Icon>
        </View>
      </TouchableOpacity>
    );
  }

  renderSelectMultipleButton() {
    //Not implemented yet.
    return null;
    return (
      <TouchableOpacity
        onPress={this.toggleSelectMultiple.bind(this)}
        style={styles.multipleButtonContainer}>
        <View style={styles.multipleButtonView}>
          <Icon style={styles.multipleButtonText} name='ios-browsers-outline'></Icon>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    if (!this.state.currentImageDimensions) {
      return null;
    }
    return (
      <View style={styles.toolBarContainer}>
        <View style={styles.leftToolbarColumn}>
          {this.renderViewPortButton()}
        </View>
        <View style={styles.rightToolbarColumn}>
          {this.renderSelectMultipleButton()}
        </View>
      </View>
    );
  }
}
