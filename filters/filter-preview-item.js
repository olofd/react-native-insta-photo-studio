import React, {Component} from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import fonts from 'GKFonts';
import FilteredImage from './filtered-image';
export default class FilterPreviewItem extends Component {

  render() {
    return (
      <TouchableOpacity onPress={e => this.props.applyFilter(this.props.filter)} style={[styles.container, this.props.style]}>
        <Text style={styles.filterName}>{this.props.filter.name}</Text>
        <View style={styles.imageContainer}>
          <FilteredImage
            width={this.props.width}
            height={this.props.height}
            image={this.props.image}
            imageSize={this.props.imageSize}
            effects={this.props.filter.settings}>
          </FilteredImage>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container : {
    alignItems : 'center'
  },
  filterName : {
    fontFamily : fonts.sansSerifSemiBold,
    fontSize : 11
  },
  imageContainer : {
    marginTop : 8,
    width : 85,
    height : 85,
    backgroundColor : 'red'
  }
});
