import RNPhotosFramework from '../../react-native-photos-framework';

export default class AlbumService {

    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
    }

    async fetchAlbums() {
        await this.fetchCurrentAlbums();
        await this.fetchCurrentAlbum();
    }

    async fetchCurrentAlbums() {
        const albums = await this._getAlbums();
        return this.setCurrentAlbums(albums);
    }

    setCurrentAlbums(albums) {
        if (albums !== this.currentAlbums) {
            this.currentAlbums = this.filterAlbums(albums);
            this.eventEmitter.emit('onCurrentAlbumsChanged', this.currentAlbums);
        }
        return this.currentAlbums;
    }

    async fetchCurrentAlbum() {
        const allAlbum = await this.getAllPhotosAlbum();
        if (!allAlbum) {
            console.log('Could not find default album');
        }
        return this.setCurrentAlbum(allAlbum);
    }

    setCurrentAlbum(album) {
        if (album !== this.currentAlbum) {
            this.currentAlbum = album;
            this.eventEmitter.emit('onCurrentAlbumChanged', album);
        }
        return this.currentAlbum;
    }

    filterAlbums(queryResult) {
        const smartAlbumExludeList = ['smartAlbumVideos', 'smartAlbumSlomoVideos', 'smartAlbumTimelapses'];
        return queryResult.instagramAppAlbumSort().filter(album => {
            const notExludedSubType = (smartAlbumExludeList.indexOf(album.subType) === -1);
            return notExludedSubType && album.assetCount > 0;
        });
    }

    async _getAlbums() {
        return await RNPhotosFramework.getAlbumsCommon({
            trackInsertsAndDeletes: true,
            trackChanges: true,
            assetCount: 'exact',
            includeMetaData: false,
            previewAssets: 2
        }, true).then((queryResult) => {
            queryResult.onChange((changeDetails, update, unsubscribe) => {
                const newQueryResult = update();
                this.setCurrentAlbums(newQueryResult);
            });
            return queryResult;
        });
    }

    async getAllPhotosAlbum() {
        return this.currentAlbums.find(album => album.type === 'smartAlbum' && album.subType === 'smartAlbumUserLibrary');
    }
}