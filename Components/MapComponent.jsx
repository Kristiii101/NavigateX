import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import MapView from 'react-native-maps';

const MapComponent = ({ region, onRegionChange }) => {
  return (
    <MapView
      style={styles.map}
      region={region}
      showsUserLocation
      showsMyLocationButton={false}
      onRegionChangeComplete={onRegionChange}
    />
  );
};

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default MapComponent;
