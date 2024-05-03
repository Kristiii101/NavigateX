// LocationButton.js
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View} from 'react-native';

const LocationButton = ({ onPress }) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>📍</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  button: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 20,
    elevation: 3,  // for Android shadow
    shadowOpacity: 0.5,  // for iOS shadow
    shadowRadius: 5,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 2 },
  },
  buttonText: {
    fontSize: 20,
  },
});

export default LocationButton;
