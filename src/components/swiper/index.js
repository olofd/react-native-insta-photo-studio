import {
  ScrollView
} from 'react-native';
import React, {Component} from 'react';

export default class Swiper extends Component {

  constructor(props) {
    super(props);
    this.lastX = 0;
    this.lastSelectedPage = 0;
    //Just som optimizations:
    this.onMomentumScrollEndBound = this.onMomentumScrollEnd.bind(this);
    this.onSwiperTouchEndBound = this.onSwiperTouchEnd.bind(this);
    this.onTouchStartBound = this.onTouchStart.bind(this);
    this.refReciverBound = this.refReciver.bind(this);
  }

  scrollToPage(page) {
    const x = this.props.window.width * page;
    this.scrollView && this.scrollView.scrollTo({x: x, y: 0, true});
  }

  onSwiperTouchEnd(e) {
    //No idea why I need to subract 10 here, please enlighten me!:
    const topBoundary = this.props.window.width + this.props.topBarHeight;
    if(e.nativeEvent.pageY > topBoundary) {
      let distance = ((this.lastX - e.nativeEvent.pageX) - 10);
      let newPage = this.lastSelectedPage + (distance > 0
        ? 1
        : -1);
      if (distance < 0) {
        distance = distance * -1;
      }
      if (distance > (this.props.window.width / 2)) {
        //transision will happen
        this.props.pageWillChange && this.props.pageWillChange(newPage, this.lastSelectedPage);
      }
    }
  }

  onMomentumScrollEnd(e) {
    const page = e.nativeEvent.contentOffset.x / this.props.window.width;
    this.props.selectedPageChanged && this.props.selectedPageChanged(page, this.lastSelectedPage);
    this.lastSelectedPage = page;
  }

  onTouchStart(e) {
    this.lastX = e.nativeEvent.pageX;
  }

  refReciver(scrollView) {
    this.scrollView = scrollView;
  }

  render() {
    return (
      <ScrollView
        ref={this.refReciverBound}
        onMomentumScrollEnd={this.onMomentumScrollEndBound}
        onTouchEnd={this.onSwiperTouchEndBound}
        onTouchStart={this.onTouchStartBound}
        horizontal={true}
        pagingEnabled={true}
        bounces={false}>
        {this.props.children}
      </ScrollView>
    );
  }
}
