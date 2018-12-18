import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import React, { Component } from 'react';
import FilteredImage from '../../filters/filtered-image';
import RNPhotosFramework from '../../../react-native-photos-framework';
import NormalFilter from '../../filters/filter-settings/faro';

/*RNPhotosFramework.createAssets({
    images : [{uri : 'test-image.jpg'}]
});*/

export default class EditView extends Component {

    constructor() {
        super();
        this.state = {
            currentStepName: 'select'
        };
        this.listeners = [];
    }

    componentWillUnmount() {
        this.listeners.forEach(cb => cb && cb());
    }

    componentWillMount() {
        this.listeners.push(this.props.appService.onEditStepUpdated((stepIndex, stepName, stepModel) => {
            if (stepName !== this.state.stepName) {
                this.setState({
                    isVisible: stepName === 'edit',
                    stepName: stepName
                });
            }
            if (stepName === 'load-cropped-images' && stepModel) {
                const image = stepModel.length === 1 ? stepModel[0] : null;
                const images = stepModel.length > 1 ? stepModel : null;
                this.setState({
                    image: image,
                    images: images,
                    stepModel : stepModel,
                });
            }
        }));
    }

    onImagesLoaded() {
        this.props.appService.moveEditStep('next', 'edit', this.state.stepModel);
    }

    componentWillReceiveProps(nextProps) {

    }

    renderSingleImage() {
        if (!this.state.image) {
            return null;
        }
        const image = { uri: this.state.image.croppedUri };
        return (
            <FilteredImage onLoad={this.onImagesLoaded.bind(this)} effects={NormalFilter.settings} width={375} height={375} image={image}></FilteredImage>
        );
    }

    render() {
        const visible = {
            opacity: this.state.isVisible ? 1 : 0

        }
        return (
            <View
                pointerEvents='none'
                style={[styles.container, this.props.style, visible]}>
                {this.renderSingleImage()}
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor : 'white'
    }
});
