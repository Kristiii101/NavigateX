import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const MapComponent = ({ region, onRegionChange, marker, route }) => {
  return (
    <MapView
      style={styles.map}
      region={region}
      showsUserLocation
      onRegionChangeComplete={onRegionChange}
    >
      {marker && (
        <Marker
          coordinate={marker}
          //title="Searched Location"
        />
      )}
      {route && (
        <Polyline
          coordinates={route}
          strokeColor="blue" // Color of the route line
          strokeWidth={3} // Width of the route line
        />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapComponent;
