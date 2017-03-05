import ImageMedia from './image-media';
import EventEmitter from 'react-native/Libraries/EventEmitter/EventEmitter';
export default class MediaStore {

    constructor(eventEmitter, magnification, window) {
        this.eventEmitter = eventEmitter;
        this.currentMagnification = magnification;
        this.currentWindow = window;
        this.selectedAssets = [];
        this.currentLoadedMedia = [];
        this.multiSelectMode = false;
    }

    selectionRequested(albumAssetService, asset) {
        const selectionModel = this._setSelectionAndReturnImagesToRerender(asset);
        this.eventEmitter.emit('onSelectionChanged', this.selectedAssets, selectionModel.imagesToRerender, selectionModel.newSelection, albumAssetService);
    }

    _setSelectionAndReturnImagesToRerender(asset) {
        let imagesToRerender = [];
        const selectedAsset = this.selectedAssets.find(media => media.uri === asset.uri);
        if (selectedAsset) {
            const indexOfSelectedAsset = this.selectedAssets.indexOf(selectedAsset);
            this.selectedAssets.splice(indexOfSelectedAsset, 1);
            imagesToRerender.push(selectedAsset);
            return {imagesToRerender};
        }
        if (!this.multiSelectMode && this.selectedAssets.length > 0) {
            imagesToRerender = this.selectedAssets;
            this.selectedAssets = [];
        }
        const media = this.getImageMedia(asset);
        imagesToRerender.push(media);
        this.selectedAssets.push(media);
        return {imagesToRerender, newSelection : media};
    }

    deselectAssets(assets) {

    }

    getImageMedia(image) {
        const imageToUse = (typeof image === 'string') ? {
            uri: image
        } : image;
        const currentImageMedia = this.currentLoadedMedia.find(cropperImage => cropperImage.uri === imageToUse.uri);
        if (currentImageMedia) {
            return currentImageMedia;
        }
        const imageMedia = new ImageMedia();
        imageMedia.initWithAsset(imageToUse, this.currentMagnification, this.currentWindow);
        this.currentLoadedMedia.push(imageMedia);
        return imageMedia;
    }
}