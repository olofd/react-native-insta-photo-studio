import {
  ScrollView,
  Animated,
  InteractionManager,
  Easing,
  Dimensions,
  StyleSheet
} from 'react-native';
import React, {Component} from 'react';

export default class Swiper extends Component {

  constructor(props) {
    super(props);
  }

  scrollToPage(page) {
    const x = this.props.window.width * page;
    this.scrollView && this.scrollView.scrollTo({
      x : x,
      y : 0,
      true
    })
  }

  onSwiperTouchEnd(e) {
    //No idea why I need to subract 10 here, please enlighten me!:
    /*const distance = ((this.lastX - e.nativeEvent.pageX) - 10);
    if (distance > (this.props.window.width / 2)) {
      //transision will happen
      this.revealTopBar(this.state.currentSwiperIndex === 0
        ? 1
        : 0);
      this.updateHeader(this.state.currentSwiperIndex === 1
        ? 'library'
        : 'photo');
    }*/
  }

  onMomentumScrollEnd(e) {
    /*  this.setState({currentSwiperIndex: state.index});
    this.updateHeader(state.index === 0
      ? 'library'
      : 'photo')
    this.revealTopBar(state.index);*/
  }

  render() {
    return (
      <ScrollView
        ref={scrollView => this.scrollView = scrollView}
        onMomentumScrollEnd={this.onMomentumScrollEnd.bind(this)}
        onTouchEnd={this.onSwiperTouchEnd.bind(this)}
        horizontal={true}
        pagingEnabled={true}
        bounces={false}>
        {this.props.children}
      </ScrollView>
    );
  }
}

Swiper.defaultProps = {};

const styles = StyleSheet.create({});
