import EventEmitter from '../../event-emitter';
const totalAmountOfSteps = 4;
import controlFlowSteps from './control-flow-steps';
import cameraRollService from './camera-roll-service';
class AppService extends EventEmitter {

    constructor() {
        super();
        this.currentEditStep = 0;
    }
 
    onEditStepUpdated(cb) {
        this.addListener('onEditStepUpdated', cb);
        return () => this.removeListener('onEditStepUpdated', cb);
    } 

    moveEditStep(direction) {
        const markedForExport = cameraRollService.mediaStore.markedForExportMedia;
        if (!markedForExport || !markedForExport.length) {
            return this.emitEditStepMoveError('No media to move to next step');
        }
        const nextStep = this.getNextStep(direction);
        if (nextStep === undefined) {
            return this.emitEditStepMoveError('Invalid direction');
        }
        this.currentEditStep = nextStep;
        return this.emitEditStepUpdated(nextStep, markedForExport);
    }

    emitEditStepUpdated(nextStep, model) {
        this.emit('onEditStepUpdated', nextStep, controlFlowSteps[nextStep], model);
    }

    emitEditStepMoveError(errorMessage) {
        this.emit('onEditStepMoveError', errorMessage);
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

export default new AppService();