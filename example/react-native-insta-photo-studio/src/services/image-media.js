import EventEmitter from '../../event-emitter';
import {
    Image
} from 'react-native';
export default class ImageMedia extends EventEmitter {

    get image() {
        return this.imageInfo.image;
    }

    get uri() {
        return this.imageInfo.image.uri;
    }

    onRequestImageInfo(cb) {
        if(this.imageDataLoaded) {
            cb && cb(this.imageInfo);
            return () => {};
        }
        this.addListener('onRequestImageInfo', cb);
        return () => this.removeListener('onRequestImageInfo', cb);
    }

    updateLastScrollEvent(scrollEvent) {
        this.lastScrollEvent = scrollEvent;
    }

    initWithAsset(image, magnification, window, cb) {
        console.log('INITING IMAGE');
        this.getImage(image, (image, width, height) => {
            this.imageInfo = {
                window,
                image,
                ...this.getImageRatioInfo({
                    width,
                    height
                }),
                width,
                height
            };
            this.imageInfo.magnification = this.getMagnification(this.imageInfo, magnification);
            this.imageInfo.minimumZoomLevel = this.getMinimumZoomLevel(this.imageInfo);
            const maximumZoomLevel = this.imageInfo.minimumZoomLevel * 4;
            this.maximumZoomLevel = maximumZoomLevel < 1 ? 1 : maximumZoomLevel;
            this.imageInfo.previewSurface = this.getMainPreviewImageDiemensions(this.imageInfo);
            this.imageInfo.zoomRect = this.getZoomRect(this.imageInfo);
            this.imageDataLoaded = true;
            this.emit('onRequestImageInfo', this.imageInfo);
            cb && cb(this.imageInfo);
        });
    }

    getImage(image, cb) {
        if (image.width !== undefined && image.height !== undefined) {
            let opportunisticImage = image;
            if (image.withOptions) {
                opportunisticImage = image.withOptions({
                    deliveryMode: 'opportunistic'
                });
            }
            cb(opportunisticImage, image.width, image.height);
        } else {
            return Image.getSize(image.uri, (width, height) => {
                cb(image, width, height);
            });
        }
    }

    getImageRatioInfo(imageDimensions) {
        let largerField = 'width';
        let smallerField = 'height';
        if (imageDimensions.width < imageDimensions.height) {
            largerField = 'height';
            smallerField = 'width';
        }
        const imageRatio = imageDimensions[largerField] / imageDimensions[smallerField];
        return {
            imageRatio,
            largerField,
            smallerField
        };
    }

    getMinimumZoomLevel(imageInfo) {
        const largerFieldValue = (imageInfo.window.width * imageInfo.magnification) * imageInfo.imageRatio;
        const zoomLevel = imageInfo.window.width / largerFieldValue;
        return zoomLevel;
    }

    getMagnification(imageInfo, requestedMagnification) {
        //We need to magnify for zoomToRect not to flip out in it's animations.
        //read: https://recalll.co/app/?q=ios%20-%20-%5BUIScrollView%20zoomToRect:animated:%5D%20weird%20behavior%20when%20contentSize%20%3C%20bounds.size
        if (requestedMagnification <= 1.0) {
            return 1.01;
        }
        const {
            largerField,
            smallerField,
            imageRatio,
            window
        } = imageInfo;
        const largerFieldValue = (window.width * requestedMagnification) * imageRatio;
        if (largerFieldValue <= window.width.width) {
            return 1.01;
        }
        return requestedMagnification;
    }

    getMainPreviewImageDiemensions(imageInfo) {
        const {
            largerField,
            smallerField,
            imageRatio,
            window,
            magnification
        } = imageInfo;
        const magnifiedWindow = (window.width * magnification);
        const largerFieldValue = magnifiedWindow * imageRatio;
        const smallerFieldValue = magnifiedWindow;
        const preview = {
            [smallerField]: smallerFieldValue,
            [largerField]: largerFieldValue
        };
        return preview;
    }

    getZoomRect(imageInfo) {
        const {
            window,
            magnification
        } = imageInfo;
        const {
            width,
            height
        } = imageInfo.previewSurface;
        const fixedSize = height > width ?
            width :
            height;
        let x = 0,
            y = 0;
        if (width > height) {
            x = ((width - (window.width * magnification)) / 2);
        } else {
            y = ((height - (window.width * magnification)) / 2)
        }
        return {
            x,
            y,
            width: fixedSize,
            height: fixedSize
        };
    }

    crop() {
        const offsetY = this.lastScrollEvent.contentOffset.y / this.lastScrollEvent.contentSize.height;
        const offsetX = this.lastScrollEvent.contentOffset.x / this.lastScrollEvent.contentSize.width;
        const {
            width,
            height
        } = this.state.currentImageDimensions;
        let newX = width * offsetX;
        let newY = height * offsetY;
        let newWidth = width / (this.lastScrollEvent.zoomScale * this.getMagnification());
        let newHeight = width / (this.lastScrollEvent.zoomScale * this.getMagnification());
        if (newWidth > width) {
            newWidth = width;
        }
        if (newHeight > height) {
            newHeight = height;
        }
        if (newX < 0) {
            newX = 0;
        }
        if (newY < 0) {
            newY = 0;
        }
        const cropData = {
            offset: {
                x: newX,
                y: newY
            },
            size: {
                width: newWidth,
                height: newHeight
            }
        };

        return new Promise((resolve, reject) => {
            ImageEditor.cropImage(this.state.currentImage, cropData, (croppedUri) => {
                resolve(croppedUri);
            }, (failure) => reject(failure));
        });
    }
}