import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const MapComponent = ({ region, onRegionChange, marker, route, onPoiClick, onMapPress }) => {
  return (
    <MapView
      style={styles.map}
      region={region}
      showsUserLocation
      showsMyLocationButton = {false}
      showsCompassButton = {false}
      onRegionChangeComplete={onRegionChange}
      ////////////////////////////////////////////////  POI //////////////////
      onPoiClick={(e) => {
        const poi = e.nativeEvent.coordinate;
        const name = e.nativeEvent.name;
        onPoiClick(poi, name);
      }}
      onPress={(e) => {
        // Ignore marker clicks
        if (e.nativeEvent.action !== 'marker-press') {
          onMapPress();
        }
      }}
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
