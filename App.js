import React, { useState, useEffect, useRef } from 'react';
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

/////////////////////////// used constants //////////////////////////////////

  const [mapRegion, setMapRegion] = useState(regions);
  const [errorMsg, setErrorMsg] = useState(null);
  const clearErrorMessage = () => {
    setTimeout(() => {
      setErrorMsg(null);
    }, 5000); // Clear the error message after 10 seconds
  };
  const [marker, setMarker] = useState(null);
  const [route, setRoute] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedPoiName, setSelectedPoiName] = useState('');
  const autocompleteRef = useRef();

 /////////////////////////////////////////////////////////////////////////////


  const fetchUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission denied');
      clearErrorMessage();
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
        setSelectedPoiName('');//////////////// name of the POI
        setRoute(null);
      } else {
        console.log('No results found');
        setErrorMsg('No results found');
        clearErrorMessage();
      }
    } catch (error) {
      console.error('Failed to fetch locations', error);
      setErrorMsg('Failed to fetch locations');
      clearErrorMessage()
    }
  };

////////////////////////////////////////////////////////////////////////////////////////////////////
// Searched routes

const fetchRoute = async () => {
  if (!currentLocation || !marker) {
    setErrorMsg('Destination not set');
    clearErrorMessage();
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
      setErrorMsg('No route found');
      clearErrorMessage();
    }
  } catch (error) {
    console.error('Failed to fetch route', error);
    setErrorMsg('Failed to fetch route');
    clearErrorMessage();
  }
};

const clearSearch = () => {
  setMarker(null); // clear marker
  setRoute(null); // Clear the route 
  setSelectedPoiName(''); // clear the POI
  autocompleteRef.current.setAddressText('');
  //autocompleteRef.current.setAddressText('');
  autocompleteRef.current?.blur();
};

const clearPOI = () => {
  //setMarker(null); // clear marker
  setSelectedPoiName(''); // clear the POI
  autocompleteRef.current?.clear();
  autocompleteRef.current?.blur();
};


////////////////////////////////////////////////////////////////////////////////////////////////////
  return (
    <View style={styles.container}>
      <MapComponent 
        region={mapRegion} 
        onRegionChange={setMapRegion} 
        marker={marker} 
        route={route} 
        onPoiClick={(poi, name) => {
          setMarker(poi);
          setRoute(null);
          setSelectedPoiName(name);
          autocompleteRef.current?.setAddressText(name); // Set the POI name in the autocomplete input
        }} onMapPress={clearPOI} 
      />
      <LocationButton onPress={fetchUserLocation} />
      <SearchAutoCompleteComponent 
        handleLocationSearch={handleLocationSearch} 
        clearSearch={clearSearch} 
        selectedPoiName={selectedPoiName} // Pass the selected POI name
        ref={autocompleteRef}
      />

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
    marginTop: 200,
    backgroundColor: 'white',
    fontSize: 25,
    
  },
});