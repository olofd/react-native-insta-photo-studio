import React, { Component } from 'react';
import { View, StyleSheet, PixelRatio, TouchableOpacity, InteractionManager } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default class ToolBar extends Component {

  constructor() {
    super();
    this.state = {
      multiExportModeEnabled: false
    };
    this.listeners = [];
  }

  componentWillMount() {
    const { mediaStore } = this.props.appService;
    this.listeners.push(mediaStore.onToogleMultiExportMode((multiExportModeEnabled) => {
      if (multiExportModeEnabled !== this.state.multiExportModeEnabled) {
        this.setState({
          multiExportModeEnabled: multiExportModeEnabled
        });
      }
    }, true));
  }

  componentWillUnmount() {
    this.listeners.forEach(cb => cb());
  }

  toogleViewportZoom() {
    this.props.image.toogleViewportZoom();
  }

  toggleSelectMultiple() {
    const { mediaStore } = this.props.appService;
    this.setState({
      multiExportModeEnabled: !this.state.multiExportModeEnabled
    });
    InteractionManager.runAfterInteractions(() => {
      mediaStore.toogleMultiExportMode();
    });
  }

  renderViewPortButton() {
    const { width, height } = this.props.image.image;
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
    return (
      <TouchableOpacity
        onPress={this.toggleSelectMultiple.bind(this)}
        style={[styles.multipleButtonContainer, this.state.multiExportModeEnabled ? styles.multipleButtonContainerSelected : undefined]}>
        <View style={styles.multipleButtonView}>
          <Icon style={styles.multipleButtonText} name='ios-browsers-outline'></Icon>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    if (!this.props.image) {
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


const styles = StyleSheet.create({
  toolBarContainer: {
    flex: 1,
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  leftToolbarColumn: {
    flex: 1,
    alignItems: 'flex-start'
  },
  rightToolbarColumn: {
    flex: 1,
    alignItems: 'flex-end'
  },
  zoomButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    width: 30,
    backgroundColor: 'rgba(21, 21, 21, 0.6)',
    borderRadius: 15,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1 / PixelRatio.get()
  },
  zoomButtonText: {
    color: 'white',
    fontSize: 13
  },
  zoomButtonRotationView: {
    transform: [
      {
        rotate: '45deg'
      }
    ]
  },
  multipleButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    width: 30,
    backgroundColor: 'rgba(21, 21, 21, 0.6)',
    borderRadius: 15,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1 / PixelRatio.get(),
  },
  multipleButtonContainerSelected: {
    backgroundColor: '#4F98EA',
    borderWidth: 0
  },
  multipleButtonView: {

  },
  multipleButtonText: {
    color: 'white',
    fontSize: 18
  }
})