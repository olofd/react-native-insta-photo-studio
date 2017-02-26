import {View, StyleSheet} from "react-native";
import React, {Component, PropTypes} from "react";

const styles = StyleSheet.create({
  root: {
    flexDirection: "column",
    flex: 1,
    paddingTop: 10,
    paddingBottom: 40,
    backgroundColor: "#EEE",
    /*
    shadowColor: "#000",
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3
    */
  }
});

export default class EffectsPanel extends Component {

  render () {
    const {children} = this.props;
    return (
      <View style={styles.root}>{children}</View>
    );
  }
}

EffectsPanel.propTypes = {
  children: PropTypes.node.isRequired
};
