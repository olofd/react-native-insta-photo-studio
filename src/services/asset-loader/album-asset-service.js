import EventEmitter from '../../../event-emitter';
import columnSplitter from './column-splitter';
import Queue from 'promise-queue';

export default class AlbumAssetService extends EventEmitter {

    constructor(eventEmitter, album) {
        super();
        this.eventEmitter = eventEmitter;
        this.album = album;
        this.fetchParams = {
            trackInsertsAndDeletes: true,
            trackChanges: false
        };
        this.fetchRound = -1;
        this.startIndex = 0;
        this.assets = [];
        this.columnSplittedAssets = [];
        this.columns = 4;
        this.allAssetsLoaded = false;
        this.queue = new Queue(1, Infinity);
        this.loadInitCycles();
        this.setupSelectionRerendering();
    }

    setupSelectionRerendering() {
        this.eventEmitter.addListener('onSelectionChanged', (selectedImages, imagesToRerender, newSelection, albumAssetService) => {
            if (albumAssetService === this) {
                const rowIndexToScrollTo = columnSplitter.markRowsForRerender(this.columnSplittedAssets, imagesToRerender.map(image => image.uri), newSelection);
                this.emit('onSelectionChanged', selectedImages, rowIndexToScrollTo, this.columnSplittedAssets);
            }
        });
    }

    requestAssets() {
        if (this.allAssetsLoaded) {
            return false;
        }
        this.queue.add(this.loadAssets.bind(this, 170));
    }

    loadInitCycles() {
        //We load three rounds of small batches to start with. To get things going.
        if (this.fetchRound < 3) {
            const fetchNum = 12;
            for (let i = 0; i < 3; i++) {
                this.queue.add(() => {
                    const fetchNumber = this.fetchRound === -1 ?
                        fetchNum :
                        (fetchNum * (this.fetchRound + 1)) * 3;
                    return this.loadAssets(fetchNumber);
                });
            }
        }
    }

    loadAssets(fetchNumber) {
        if (this.allAssetsLoaded) {
            return false;
        }
        this.fetchRound++;
        const fetchParams = {
            ...this.fetchParams,
            startIndex: this.startIndex,
            endIndex: this.startIndex + fetchNumber
        };
        console.log('Loading assets');

        return this.album.getAssets(fetchParams).then((data) => {
            this.allAssetsLoaded = data.includesLastAsset;
            this.startIndex = (this.startIndex + (data.assets.length));
            this.assets = this.assets.concat(data.assets);
            this.columnSplittedAssets = columnSplitter.appendToState(this.columnSplittedAssets, data.assets, this.columns);
            this.emit('onNewAssetsRecived', this.columnSplittedAssets, data.assets, this.assets);
        });
    }

    onNewAssetsRecived(cb) {
        if (this.assets.length) {
            cb(this.columnSplittedAssets, this.assets, this.assets);
        }
        this.addListener('onNewAssetsRecived', cb);
        return () => this.removeListener('onNewAssetsRecived', cb);
    }

    onSelectionChanged(cb) {
        this.addListener('onSelectionChanged', cb);
        return () => this.removeListener('onSelectionChanged', cb);
    }

    setupChangeHandling(album) {
        if (album) {
            console.log('setup change tracking for', album.title);
            this.albumChangeHandler = album.onChange((changeDetails, update) => {
                const updatedImagesArray = update(this.state.images);
                if (this.state.selected && this.state.selected.length) {
                    const selectedImagesToRemove = [];
                    const newSelectedImages = this.state.selected.filter((selected, index) => {
                        return updatedImagesArray.some(asset => asset.localIdentifier === selected.localIdentifier);
                    });

                    if (!newSelectedImages.length) {
                        if (updatedImagesArray.length) {
                            const imageToSelect = updatedImagesArray[0];
                            newSelectedImages.push(imageToSelect);
                            this.props.onSelectedImagesChanged(newSelectedImages, undefined);
                        } else {

                        }
                    }
                    console.log('Album Change', changeDetails, album.title, newSelectedImages);

                    this.setState({
                        selected: newSelectedImages
                    });
                }
                this.setState({
                    images: updatedImagesArray,
                    dataSource: this.appendToState([], updatedImagesArray, this.props.imagesPerRow),
                    shouldUpdate: this.guid()
                });
            });
        }
    }
}