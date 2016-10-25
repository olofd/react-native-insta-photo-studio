import {
    CameraRoll
} from 'react-native';
import RNPhotosFramework from 'react-native-photos-framework';

export default class CameraRollService {
    static getPhotos(fetchParams) {
        return CameraRoll.getPhotos(fetchParams).then((data) => {
            return {
              images : data.edges.map(edge => edge.node.image),
              page_info : data.page_info
            };
        });
    }

    static getPhotosPhotoKit(fetchParams) {
        return RNPhotosFramework.getAssets(fetchParams).then((data) => {
            return {
              images : data,
              page_info : {
                has_next_page : true
              }
            };
        });
    }
}
