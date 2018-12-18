const totalAmountOfSteps = 4;
const CROPPER_MAGNIFICATION = 2;
import { Dimensions } from 'react-native';
import controlFlowSteps from './control-flow-steps';
import CameraRollService from './camera-roll-service';
import EventEmitter, { events } from './event-emitter';
import MediaStore from './media-store';

class AppService extends EventEmitter {

    constructor(imageEditor) {
        super();
        this.currentEditStep = 0;
        this.cameraRollService = new CameraRollService(this);
        this.mediaStore = new MediaStore(this, CROPPER_MAGNIFICATION, imageEditor);
        this.currentWindow = Dimensions.get('window');
        this.setupRequestWindow();
        this.setupListernerForStepMove();
    }

    setupListernerForStepMove() {
        this.addListener(events.requestEditStepMove, (direction, nextStepName, stepModel) => {
            this.moveEditStep(direction, nextStepName, stepModel);
        });
    }

    openSettings() {
        Linking.openURL('app-settings:');
    }

    onEditStepUpdated(cb) {
        this.addListener(events.onEditStepUpdated, cb);
        return () => this.removeListener(events.onEditStepUpdated, cb);
    }

    updateCurrentWindow(window) {
        if (window && (!this.currentWindow || (window.width !== this.currentWindow.width || window.height !== this.currentWindow.height))) {
            this.currentWindow = window;
            this.emit(events.onWindowChanged, this.currentWindo);
        }
    }

    onWindowChanged(cb, initalCallback) {
        if (initalCallback && this.window) {
            cb && cb(this.currentWindow);
        }
        this.addListener(events.onWindowChanged, cb);
        return () => this.removeListener(events.onWindowChanged, cb);
    }

    setupRequestWindow() {
        this.addListener(events.requestWindow, (listener, subscribe, unsubscribe) => {
            listener(this.currentWindow);
            if (subscribe) {
                const unsubscribeFunc = this.onWindowChanged(listener, false);
                unsubscribe && unsubscribe(unsubscribeFunc);
            }
        });
    }

    moveEditStep(direction, nextStepName /*optional*/, stepModel /*optional*/) {
        const moveFunction = (direction, nextStepName, stepModel) => {
            if (!stepModel) {
                return this.emitEditStepMoveError('No media to move to next step');
            }
            let nextStep;
            if (!nextStepName) {
                nextStep = this.getNextStep(direction);
            } else {
                nextStep = controlFlowSteps.indexOf(nextStepName);
            }
            if (nextStep === undefined || nextStep === -1) {
                return this.emitEditStepMoveError('Invalid direction');
            }
            this.currentEditStep = nextStep;
            return this.emitEditStepUpdated(nextStep, stepModel);
        };

        if (stepModel) {
            return moveFunction(direction, nextStepName, stepModel);
        }
        return this.emit(events.requestMarkedForExportMedia, (markedForExport) => {
            moveFunction(direction, nextStepName, markedForExport);
        });
    }

    emitEditStepUpdated(nextStep, model) {
        console.log('EditStepUpdated', nextStep, controlFlowSteps[nextStep], model);
        this.emit(events.onEditStepUpdated, nextStep, controlFlowSteps[nextStep], model);
    }

    emitEditStepMoveError(errorMessage) {
        this.emit(events.onEditStepMoveError, errorMessage);
        return errorMessage;
    }

    getNextStep(direction) {
        const incremention = direction === 'next' ? 1 : -1;
        const proposedNextStep = this.currentEditStep + incremention;
        if (proposedNextStep >= 0 && proposedNextStep < controlFlowSteps.length) {
            //valid
            return proposedNextStep;
        }
    }
}

export default AppService;