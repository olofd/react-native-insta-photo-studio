import EventEmitter, { events } from './event-emitter';
import {
    Image
} from 'react-native';

export const imageMediaEvents = {
    onRequestImageInfo: 'onRequestImageInfo',
    onToogleViewportZoom: 'onToogleViewportZoom'
};

export default class ImageMedia extends EventEmitter {

    constructor(eventEmitter, image, magnification, cb, imageEditor) {
        super();
        this.imageEditor = imageEditor;
        this.isMarked = false;
        this.magnification = magnification;
        eventEmitter.emit(events.requestWindow, (window) => {
            this.initWithAsset(image, magnification, window, cb);
        }, true);
    }

    get image() {
        return this.imageInfo.image;
    }

    get uri() {
        return this.imageInfo.image.uri;
    }

    marked() {
        this.isMarked = true;
    }

    unmarked() {
        this.isMarked = false;
        if (this.lastScrollEvent) {
            delete this.lastScrollEvent;
        }
    }

    onRequestImageInfo(cb) {
        if (this.imageDataLoaded) {
            this.imageInfo.zoomRect = this.getZoomRect(this.imageInfo);
            cb && cb(this.imageInfo);
            return () => { };
        }
        this.addListener(imageMediaEvents.onRequestImageInfo, cb);
        return () => this.removeListener(imageMediaEvents.onRequestImageInfo, cb);
    }


    toogleViewportZoom() {
        this.emit(imageMediaEvents.onToogleViewportZoom);
    }

    onToogleViewportZoom(cb) {
        this.addListener(imageMediaEvents.onToogleViewportZoom, cb);
        return () => this.removeListener(imageMediaEvents.onToogleViewportZoom, cb);
    }

    updateLastScrollEvent(scrollEvent) {
        this.lastScrollEvent = scrollEvent;
    }

    initWithAsset(image, magnification, window, cb) {
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
            this.imageInfo.maximumZoomLevel = maximumZoomLevel < 1 ? 1 : maximumZoomLevel;
            this.imageInfo.previewSurface = this.getMainPreviewImageDiemensions(this.imageInfo);
            this.imageInfo.zoomRect = this.getZoomRect(this.imageInfo);
            this.imageDataLoaded = true;
            this.emit(imageMediaEvents.onRequestImageInfo, this.imageInfo);
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
            magnification,
        } = imageInfo;
        const {
            width,
            height
        } = imageInfo.previewSurface;

        const fixedSize = height > width ?
            width :
            height;

        let originalZoomRect;
        if (imageInfo.zoomRect) {
            originalZoomRect = imageInfo.zoomRect.originalZoomRect;
        } else {
            originalZoomRect = {
                width: fixedSize,
                height: fixedSize,
                x: 0,
                y: 0
            };
            if (width > height) {
                originalZoomRect.x = ((width - (window.width * magnification)) / 2);
            } else {
                originalZoomRect.y = ((height - (window.width * magnification)) / 2)
            }
        }

        let startupZoomRect = { ...originalZoomRect };
        if (this.lastScrollEvent) {
            let startupFixedSize = fixedSize / (this.lastScrollEvent.zoomScale * magnification);
            startupZoomRect.x = this.lastScrollEvent.contentOffset.x / this.lastScrollEvent.zoomScale;
            startupZoomRect.y = this.lastScrollEvent.contentOffset.y / this.lastScrollEvent.zoomScale;
            if (startupFixedSize === window.width) {
                //Some kind of crazy bug here. If the zoom-rect is exactly as big as width of the screen
                //animated false won't work when zooming to that place, hence, you'll see the animation.
                //I think this has nothing to to with RN, much to do with UI kit that somehow says that this rect is invalid.
                startupFixedSize += 0.1
            }
            startupZoomRect.width = startupFixedSize;
            startupZoomRect.height = startupFixedSize;
        }


        return {
            originalZoomRect,
            startupZoomRect
        };
    }

    crop() {
        const offsetY = this.lastScrollEvent.contentOffset.y / this.lastScrollEvent.contentSize.height;
        const offsetX = this.lastScrollEvent.contentOffset.x / this.lastScrollEvent.contentSize.width;
        const {
            image,
            magnification
        } = this.imageInfo;
        const {width, height} = image;
        let newX = width * offsetX;
        let newY = height * offsetY;
        let newWidth = width / (this.lastScrollEvent.zoomScale * magnification);
        let newHeight = width / (this.lastScrollEvent.zoomScale * magnification);
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
            this.imageEditor.cropImage(image.image, cropData, (croppedUri) => {
                this.croppedUri = croppedUri;
                resolve(this);
            }, (failure) => reject(failure));
        });
    }
} 