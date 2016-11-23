import {CameraRoll} from 'react-native';
import RNPhotosFramework from 'react-native-photos-framework';

class CameraRollService {

  constructor() {
    this.albumFetchPromise = RNPhotosFramework
      .requestAuthorization().then((status) => {
        if(!status.isAuthorized) {
          throw new Error('Unauthorized');
        }
        return RNPhotosFramework.getAlbumsCommon({
          assetCount: 'exact',
          includeMetaData: true,
          previewAssets: 2
        }, true);
      });
  }

  getPhotos(fetchParams) {
    return CameraRoll.getPhotos(fetchParams).then((data) => {
      return {
        images: data.edges.map(edge => edge.node.image),
        page_info: data.page_info
      };
    });
  }

  async getCurrentAlbum() {
    if(!this.currentAlbum) {
      this.currentAlbum = await this.getAllPhotosAlbum();
      if(!this.currentAlbum) {
        throw new Error('Could not find default album');
      }
    }
    return this.currentAlbum;
  }

  getAllPhotosAlbum() {
    return this.albumFetchPromise.then((queryResult) => {
      return queryResult.albums.find(album =>
        album.type === 'smartAlbum' &&
        album.subType === 'smartAlbumUserLibrary');
    });
  }

  getPhotosPhotoKit(fetchParams) {
    return this.getCurrentAlbum().then((currentAlbum) => {
      return RNPhotosFramework.getAssets({
        ...fetchParams,
        includeMetaData : true,
        fetchOptions: {
          sortDescriptors: [
            {
              key: 'creationDate',
              ascending: true
            }
          ]
        }
      }).then((data) => {
        return {
          images: data.assets,
          page_info: {
            has_next_page: data.includesLastAsset
          }
        };
      });
    });
  }
}

export default new CameraRollService();
