import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapComponent from './Components/MapComponent';
import LocationButton from './Components/LocationButton'; 
//import SearchComponent from './Components/SearchComponent';
import * as Location from 'expo-location';
import axios from 'axios';
import regions from './utils/regions';
import googleapikey from './utils/google_api_key';
import AutoComplete from './Components/AutoComplete';

export default function App() {

/////////////////////////////////////////////////////////////////////////////////////////////////

  const [mapRegion, setMapRegion] = useState(regions);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission denied');
      return;
    }
    let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
    setMapRegion({
      ...regions,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
   
  };

  useEffect(() => {
    fetchUserLocation();
  }, []);

//////////////////////////////////////////////////////////////////////////////////////////////////

  const handleLocationSearch = async (searchQuery) => {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${googleapikey}`;

    try {
      const response = await axios.get(url);
      const results = response.data.results;
      if (results.length > 0) {
        const firstResult = results[0].geometry.location;
        setMapRegion({
          ...regions,
            latitude: firstResult.lat,
            longitude: firstResult.lng,
        });
      } else {
        console.log('No results found');
      }
    } catch (error) {
      console.error('Failed to fetch locations', error);
    }
  
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Search for a location"
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
        />
      </View>
    );
  };

////////////////////////////////////////////////////////////////////////////////////////////////////

  return (
    <View style={styles.container}>
      <MapComponent region={mapRegion} onRegionChange={setMapRegion} />
      {/* <SearchComponent onSearch={handleLocationSearch} /> */}
      <AutoComplete onLocationSelect={handleLocationSearch} />
      <LocationButton onPress={fetchUserLocation} />
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


///my code working!