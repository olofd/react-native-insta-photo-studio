import {
  CameraRoll,
  Linking,
  Dimensions
} from 'react-native';
import RNPhotosFramework from '../../react-native-photos-framework';
import EventEmitter from '../../event-emitter';
import AlbumService from './album-service';
import AlbumAssetsService from './asset-loader/album-asset-service';
import MediaStore from './media-store';
class CameraRollService extends EventEmitter {

  constructor() {
    super();
    this.albumAssetServices = [];
    this.albumService = new AlbumService(this);
    this.mediaStore = new MediaStore(this, 2, Dimensions.get('window'));
    this.setupAlbumAssetService();
  }

  selectionRequested(albumAssetService, asset) {
    this.mediaStore.selectionRequested(albumAssetService, asset);
  }

  setCurrentAlbum(album) {
    return this.albumService.setCurrentAlbum(album);
  }

  fetchAlbums() {
    return this.albumService.fetchAlbums();
  }

  toogleMultiExportMode() {
    this.mediaStore.toogleMultiExportMode();
  }

  openSettings() {
    Linking.openURL('app-settings:');
  }

  setupAlbumAssetService() {
    this.onCurrentAlbumChanged((currentAlbum) => {
      let albumAssetService = this.albumAssetServices.find(assetService => assetService.album.localIdentifier === currentAlbum.localIdentifier);
      if (albumAssetService === undefined) {
        albumAssetService = new AlbumAssetsService(this, currentAlbum);
        this.albumAssetServices.push(albumAssetService);
      }
      if (albumAssetService !== this.currentAlbumAssetService) {
        this.currentAlbumAssetService = albumAssetService;
        this.emit('albumAssetServiceChanged', this.currentAlbumAssetService);
      }
    });
  }

  onAlbumAssetServiceChanged(cb, initalCallback) {
    if (initalCallback && this.currentAlbumAssetService) {
      cb && cb(this.currentAlbumAssetService);
    }
    this.addListener('albumAssetServiceChanged', cb);
    return () => this.removeListener('albumAssetServiceChanged', cb);
  }

  onSelectionChanged(cb) {
    this.addListener('onSelectionChanged', cb);
    return () => this.removeListener('onSelectionChanged', cb);
  }

  onListSelectionChanged(cb) {
    this.addListener('onListSelectionChanged', cb);
    return () => this.removeListener('onListSelectionChanged', cb);
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

  onMarkedForExportMediaChanged(cb, initalCallback) {
    return this.mediaStore.onMarkedForExportMediaChanged(cb, initalCallback);
  }

  onToogleMultiExportMode(cb, initalCallback) {
    return this.mediaStore.onToogleMultiExportMode(cb, initalCallback);
  }

  async authorize() {
    const authStatus = await RNPhotosFramework.requestAuthorization();
    if (authStatus.isAuthorized !== this.isAuthorized) {
      this.emit('onAuthorizationChanged', authStatus);
      this.isAuthorized = authStatus.isAuthorized;
    }
    return authStatus;
  }
}

export default new CameraRollService();