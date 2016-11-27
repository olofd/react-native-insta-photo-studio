import {CameraRoll, Linking} from 'react-native';
import RNPhotosFramework from 'react-native-photos-framework';
import EventEmitter from '../../react-native/Libraries/EventEmitter/EventEmitter';

class CameraRollService extends EventEmitter {

  constructor() {
    super();
  }

  openSettings() {
    Linking.openURL('app-settings:');
  }

  onAuthorizationChanged(cb) {
    this.addListener('onAuthorizationChanged', cb);
    return () => this.removeListener('onAuthorizationChanged', cb);
  }

  onCurrentAlbumsChanged(cb) {
    this.addListener('onCurrentAlbumsChanged', cb);
    return () => this.removeListener('onCurrentAlbumsChanged', cb);
  }

  onCurrentAlbumChanged(cb) {
    this.addListener('onCurrentAlbumChanged', cb);
    return () => this.removeListener('onCurrentAlbumChanged', cb);
  }

  async authorize() {
    const authStatus = await RNPhotosFramework.requestAuthorization();
    if(authStatus.isAuthorized !== this.isAuthorized) {
      this.emit('onAuthorizationChanged', authStatus);
      this.isAuthorized = authStatus.isAuthorized;
    }
    return authStatus;
  }

  async fetchAlbums() {
    await this.fetchCurrentAlbums();
    await this.fetchCurrentAlbum();
  }

  async fetchCurrentAlbums() {
    const albums = (await this.queryResult).albums;
    return this.setCurrentAlbums(albums);
  }

  setCurrentAlbums(albums) {
    if(albums !== this.currentAlbums) {
      this.currentAlbums = albums;
      this.emit('onCurrentAlbumsChanged', albums);
    }
    return this.currentAlbums;
  }

  async fetchCurrentAlbum() {
    const allAlbum = await this.getAllPhotosAlbum();
    if (!allAlbum) {
        console.log('Could not find default album');
    }
    return this.setCurrentAlbum(allAlbum);
  }

  setCurrentAlbum(album) {
    if(album !== this.currentAlbum) {
      this.currentAlbum = album;
      this.emit('onCurrentAlbumChanged', album);
    }
    return this.currentAlbum;
  }

  get queryResult() {
    if (!this._albumsFetch) {
      this._albumsFetch = this._getAlbums();
    }
    return this._albumsFetch;
  }

  async _getAlbums() {
    return await RNPhotosFramework.getAlbumsCommon({
      assetCount: 'exact',
      includeMetaData: false,
      previewAssets: 2
    }, true);
  }

  async getAllPhotosAlbum() {
    return (await this.queryResult).albums[0];
    return (await this.queryResult).albums.find(album => album.type === 'smartAlbum' && album.subType === 'smartAlbumUserLibrary');
  }
}

export default new CameraRollService();
