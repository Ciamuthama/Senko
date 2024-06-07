import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';

const App = () => {
  return (
    <View style={styles.box}></View>
  );
};

const styles = StyleSheet.create({
  box: {
    width: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(220, 46, 170, 0.4),rgba(220, 223, 170, 0.9)',
        shadowOffset: { width:5, height: 5 },
        shadowOpacity: 1,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
});

export default App;
