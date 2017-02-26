import React, {Component, PropTypes} from "react";
import {ScrollView, StyleSheet} from "react-native";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EEE"
  }
});

export default class AppContainer extends Component {

  render () {
    const {children} = this.props;
    return (
      <ScrollView bounces={false} style={styles.root} contentContainerStyle={styles.container}>
        {children}
      </ScrollView>
    );
  }
}

AppContainer.propTypes = {
  children: PropTypes.node.isRequired
};
