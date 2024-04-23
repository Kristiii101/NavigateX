import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

export default function App() {
  const [mapRegion, setMapRegion] = useState({
    latitude: 45.7514985,
    longitude: 21.2387673,
    latitudeDelta: 0.1,
    longitudeDelta: 0.2
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const mapRef = useRef(null);

  const userLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission denied');
      return;
    }
    let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
    const region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1
    };
    setMapRegion(region);
    mapRef.current?.animateToRegion(region, 1000);
  };

  useEffect(() => {
    userLocation();
  }, []);

  return (
    <View style={styles.container}>
      <MapView 
        ref={mapRef}
        style={StyleSheet.absoluteFillObject} 
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
      </MapView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={userLocation}>
          <Text style={styles.buttonText}>📍</Text>
        </TouchableOpacity>
      </View>
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10
  }
});
