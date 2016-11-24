import React, {Component} from 'react';
import {ListView, View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import photosFrameworkService from '../../services/camera-roll-service';
export default class AlbumList extends Component {
  constructor() {
    super();
    const ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    this.state = {
      dataSource: ds.cloneWithRows([])
    };
  }

  componentWillMount() {
    this.extendDataSource(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.extendDataSource(nextProps);
  }

  extendDataSource(props) {
    if(props.albums) {
      if (!this.state.albums || this.props.albums !== props.albums) {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(props.albums),
          albums: props.albums
        });
      }
    }
  }

  onRowPress() {
    this.props.onAlbumSelected()
  }

  renderRow(row) {
    const previewImage = row.previewAssets.length
      ? row.previewAssets[0].image
      : null;
    return (
      <TouchableOpacity style={styles.rowContainer} onPress={this.onRowPress.bind(this, row)}>
        <Image style={styles.previewImage} source={previewImage}></Image>
        <View style={styles.albumInfoContainer}>
          <Text style={styles.albumTitle}>{row.title}</Text>
          <Text style={styles.assetCount}>{row.assetCount}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <ListView
          enableEmptySections={true}
          dataSource={this.state.dataSource}
          renderRow={this.renderRow.bind(this)}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  albumInfoContainer: {
    padding: 10,
    justifyContent: 'center'
  },
  previewImage: {
    width: 70,
    height: 70
  },
  rowContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  albumTitle: {
    fontSize: 14,
    marginBottom: 5
  },
  assetCount: {
    fontSize: 12
  }
});
