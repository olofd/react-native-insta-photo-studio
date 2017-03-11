import {
  CameraRoll,
  Linking,
  Dimensions
} from 'react-native';
import RNPhotosFramework from '../../react-native-photos-framework';
import AlbumService from './album-service';
import AlbumAssetsService from './asset-loader/album-asset-service';
import {events} from './event-emitter';
class CameraRollService {

  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter;
    this.albumAssetServices = [];
    this.albumService = new AlbumService(eventEmitter);
    this.setupAlbumAssetService();
  }

  setCurrentAlbum(album) {
    return this.albumService.setCurrentAlbum(album);
  }

  fetchAlbums() {
    return this.albumService.fetchAlbums();
  }

  setupAlbumAssetService() {
    this.onCurrentAlbumChanged((currentAlbum) => {
      let albumAssetService = this.albumAssetServices.find(assetService => assetService.album.localIdentifier === currentAlbum.localIdentifier);
      if (albumAssetService === undefined) {
        albumAssetService = new AlbumAssetsService(this.eventEmitter, currentAlbum);
        this.albumAssetServices.push(albumAssetService);
      }
      if (albumAssetService !== this.currentAlbumAssetService) {
        this.currentAlbumAssetService = albumAssetService;
        this.eventEmitter.emit(events.onAlbumAssetServiceChanged, this.currentAlbumAssetService);
      }
    });
  }

  onAlbumAssetServiceChanged(cb, initalCallback) {
    if (initalCallback && this.currentAlbumAssetService) {
      cb && cb(this.currentAlbumAssetService);
    }
    this.eventEmitter.addListener(events.onAlbumAssetServiceChanged, cb);
    return () => this.eventEmitter.removeListener(events.onAlbumAssetServiceChanged, cb);
  }

  onAuthorizationChanged(cb) {
    this.eventEmitter.addListener(events.onAuthorizationChanged, cb);
    return () => this.eventEmitter.removeListener(events.onAuthorizationChanged, cb);
  }

  onCurrentAlbumsChanged(cb) {
    this.eventEmitter.addListener(events.onCurrentAlbumsChanged, cb);
    return () => this.eventEmitter.removeListener(events.onCurrentAlbumsChanged, cb);
  }

  onCurrentAlbumChanged(cb) {
    this.eventEmitter.addListener(events.onCurrentAlbumChanged, cb);
    return () => this.eventEmitter.removeListener(events.onCurrentAlbumChanged, cb);
  }

  async authorize() {
    const authStatus = await RNPhotosFramework.requestAuthorization();
    if (authStatus.isAuthorized !== this.isAuthorized) {
      this.eventEmitter.emit(events.onAuthorizationChanged, authStatus);
      this.isAuthorized = authStatus.isAuthorized;
    }
    return authStatus;
  }
}

export default CameraRollService;