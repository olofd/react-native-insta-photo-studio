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
        this.markedForExportMedia = [];
        this.loadInitCycles();
        this.setupSelectionRerendering();
        this.setupChangeHandling();
    }

    setupSelectionRerendering() {
        this.eventEmitter.onMarkedForExportMediaChanged((markedForExportMedia, affectedImage, affectedMedia) => {
            if (affectedMedia && affectedMedia.length) {
                columnSplitter.markRowsForRerender(this.columnSplittedAssets, affectedMedia.map(media => media.uri), affectedImage);
            }
            this.markedForExportMedia = markedForExportMedia;
            this.emit('onMarkedForExportMediaChanged', markedForExportMedia, this.columnSplittedAssets);
        }, true);
        this.eventEmitter.addListener('onSelectionChanged', (newSelection, oldSelection, albumAssetService) => {
            if (albumAssetService === this) {
                const updateImages = [newSelection.uri];
                if (oldSelection) {
                    updateImages.push(oldSelection.uri);
                }
                const rowIndexToScrollTo = columnSplitter.markRowsForRerender(this.columnSplittedAssets, updateImages, newSelection);
                this.emit('onSelectionChanged', newSelection, rowIndexToScrollTo, this.columnSplittedAssets);
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
            for (let i = 0; i < 1; i++) {
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

        return this.album.getAssets(fetchParams).then((data) => {
            this.allAssetsLoaded = data.includesLastAsset;
            this.startIndex = (this.startIndex + (data.assets.length));
            this.assets = this.assets.concat(data.assets);
            this.columnSplittedAssets = columnSplitter.appendToState(this.columnSplittedAssets, data.assets, this.columns);
            this.emit('onNewAssetsRecived', this.columnSplittedAssets, data.assets, this.assets);
        });
    }

    emitAssetUpdate() {

    }

    onNewAssetsRecived(cb) {
        if (this.assets.length) {
            cb(this.columnSplittedAssets, this.assets, this.assets);
        }
        this.addListener('onNewAssetsRecived', cb);
        return () => this.removeListener('onNewAssetsRecived', cb);
    }

    onMarkedForExportMediaChanged(cb) {
        if (this.markedForExportMedia.length) {
            cb(this.markedForExportMedia, this.columnSplittedAssets);
        }
        this.addListener('onMarkedForExportMediaChanged', cb);
        return () => this.removeListener('onMarkedForExportMediaChanged', cb);
    }

    onSelectionChanged(cb) {
        this.addListener('onSelectionChanged', cb);
        return () => this.removeListener('onSelectionChanged', cb);
    }

    setupChangeHandling() {
        this.albumChangeHandler = this.album.onChange((changeDetails, update) => {
            if (changeDetails.hasIncrementalChanges) {
                update(this.assets, (updatedAssetArray) => {
                    this.assets = updatedAssetArray;
                    this.columnSplittedAssets = columnSplitter.appendToState([], this.assets, this.columns);
                    this.emit('onNewAssetsRecived', this.columnSplittedAssets, this.assets, this.assets);
                }, {
                    includeMetadata: false
                });
            }
        });
    }

}