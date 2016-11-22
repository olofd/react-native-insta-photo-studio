import {CameraRoll} from 'react-native';
import RNPhotosFramework from 'react-native-photos-framework';

export default class CameraRollService {

  constructor() {
    this.albumFetchPromise = RNPhotosFramework.getAlbumsCommon()
    .then((a) => {
      return a;
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

  getPhotosPhotoKit(fetchParams) {
    return this.albumFetchPromise.then((queryResult) => {
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
