import EventEmitterEngine from '../../event-emitter';
const debug = false;
class EventEmitter extends EventEmitterEngine {
    constructor() {
        super();
        if(__DEV__ && debug) {
            //For debug purposes:
            this.emit = this._emit.bind(this);
            this.addListener = this._addListener.bind(this);
        }
        this.on = this.addListener.bind(this);
    }

    _addListener(eventName, callback) {
        if(eventName === undefined) {
            //You entered undefined as eventName === ERROR.
            console.debug('You entered undefined as eventName === ERROR', callback)
            debugger;
        }
        console.debug('Listener for', eventName);
        super.addListener(eventName, function(...args) {
            console.debug('FIRE: Event picked up for', eventName, callback);
            callback(...args);
        });
    }

    _emit(...args) {
        console.debug('Emit::', ...args);
        super.emit(...args);
    }
} 

export const events = {
    onWindowChanged : 'onWindowChanged',
    onAlbumAssetServiceChanged : 'onAlbumAssetServiceChanged',
    onAuthorizationChanged : 'onAuthorizationChanged',
    onCurrentAlbumsChanged : 'onCurrentAlbumsChanged',
    onCurrentAlbumChanged : 'onCurrentAlbumChanged',
    requestEditStepMove : 'requestEditStepMove',
    onEditStepUpdated : 'onEditStepUpdated',
    onEditStepMoveError : 'onEditStepMoveError',
    onMarkedForExportMediaChanged : 'onMarkedForExportMediaChanged',
    onUnmarkRequested : 'onUnmarkRequested',
    onSelectionChanged : 'onSelectionChanged',
    onNewAssetsRecived : 'onNewAssetsRecived',
    requestMarkedForExportMedia : 'requestMarkedForExportMedia',
    requestWindow : 'requestWindow',
    onToogleMultiExportMode : 'onToogleMultiExportMode'
};

export default EventEmitter;