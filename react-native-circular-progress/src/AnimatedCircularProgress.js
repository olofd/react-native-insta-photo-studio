import React, { PropTypes } from 'react';
import { View, Animated, InteractionManager } from 'react-native';
import CircularProgress from './CircularProgress';
const AnimatedProgress = Animated.createAnimatedComponent(CircularProgress);

export default class AnimatedCircularProgress extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      chartFillAnimation: new Animated.Value(props.prefill || 0)
    }
  }

  componentDidMount() {
  //  this.animateFill();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fill !== this.props.fill) {
    //  this.animateFill();
    }
  }

  animateFill(toValue, cb, runAfterInteractions) {
    const { tension, friction } = this.props;
    const animate = () => Animated.spring(
            this.state.chartFillAnimation,
            {
              toValue: toValue || this.props.fill,
              tension,
              friction
            }
          ).start(cb);
    if(runAfterInteractions){
      InteractionManager.runAfterInteractions(() => animate());
    }else {
      animate();
    }
  }

  performLinearAnimation(toValue, duration) {
    Animated.timing(this.state.chartFillAnimation, {
      toValue: toValue,
      duration: duration,
      useNativeDriver : true
    }).start();
  }

  setAnimationValue(toValue) {
    this.state.chartFillAnimation.setValue(toValue);
  }

  render() {
    const { fill, prefill, ...other } = this.props;

    return (
      <AnimatedProgress
        {...other}
        fill={this.state.chartFillAnimation}
        />
    )
  }
}

AnimatedCircularProgress.propTypes = {
  style: View.propTypes.style,
  size: PropTypes.number.isRequired,
  fill: PropTypes.number,
  prefill: PropTypes.number,
  width: PropTypes.number.isRequired,
  tintColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  tension: PropTypes.number,
  friction: PropTypes.number
}

AnimatedCircularProgress.defaultProps = {
  tension: 14,
  friction: 8
};
