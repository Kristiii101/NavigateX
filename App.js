import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import MapComponent  from './Components/MapComponent';
import LocationButton from './Components/LocationButton';
import RoutesButton from './Components/RoutesButton';
import * as Location from 'expo-location';
import axios from 'axios';
import regions from './utils/regions';
import googleapikey from './utils/google_api_key';
import { SearchAutoCompleteComponent } from './Components/SearchAutoCompleteComponent';
import polyline from '@mapbox/polyline';

export default function App() {

/////////////////////////////////////////////////////////////////////////////////////////////////

  const [mapRegion, setMapRegion] = useState(regions);
  const [errorMsg, setErrorMsg] = useState(null);
  const [marker, setMarker] = useState(null);
  const [route, setRoute] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  const fetchUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission denied');
      return;
    }
    let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
    const userLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setMapRegion({
      ...regions,
      ...userLocation,
    });
    setCurrentLocation(userLocation);
  };

  useEffect(() => {
    fetchUserLocation();
  }, []);

//////////////////////////////////////////////////////////////////////////////////////////////////
  //Searched location

  const handleLocationSearch = async (searchQuery) => {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${googleapikey}`;

    try {
      const response = await axios.get(url);
      const results = response.data.results;
      if (results.length > 0) {
        const firstResult = results[0].geometry.location;
        const searchLocation = {
          latitude: firstResult.lat,
          longitude: firstResult.lng,
        };
        setMapRegion({
          ...regions,
          ...searchLocation,
        });
        setMarker(searchLocation);
        setRoute(null);
      } else {
        console.log('No results found');
      }
    } catch (error) {
      console.error('Failed to fetch locations', error);
    }
  };

////////////////////////////////////////////////////////////////////////////////////////////////////
// Searched routes

const fetchRoute = async () => {
  if (!currentLocation || !marker) {
    setErrorMsg('Current location or destination not set');
    return;
  }
  const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
  const destination = `${marker.latitude},${marker.longitude}`;
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${googleapikey}`;

  try {
    const response = await axios.get(url);
    const routeData = response.data.routes[0];
    if (routeData) {
      const points = polyline.decode(routeData.overview_polyline.points);
      const routeCoordinates = points.map(point => ({
        latitude: point[0],
        longitude: point[1],
      }));
      setRoute(routeCoordinates);
    } else {
      console.log('No route found');
    }
  } catch (error) {
    console.error('Failed to fetch route', error);
  }
};

const clearSearch = () => {
  setMarker(null);
  setRoute(null); // Clear the route as well if needed
};

////////////////////////////////////////////////////////////////////////////////////////////////////
  return (
    <View style={styles.container}>
      <MapComponent region={mapRegion} onRegionChange={setMapRegion} marker={marker} route={route} />
      <LocationButton onPress={fetchUserLocation} />
      <SearchAutoCompleteComponent handleLocationSearch ={handleLocationSearch} clearSearch={clearSearch} />

      <RoutesButton onPress={fetchRoute} /> 
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});