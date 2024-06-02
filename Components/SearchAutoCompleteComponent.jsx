import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import googleapikey from '../utils/google_api_key';

export const SearchAutoCompleteComponent = React.forwardRef(({ handleLocationSearch, selectedPoiName, clearSearch }, ref) => {
  const autocompleteRef = ref || useRef();

  useEffect(() => {
    if (selectedPoiName) {
      autocompleteRef.current?.setAddressText(selectedPoiName);
    }
  }, [selectedPoiName]);

  const handleClearSearch = () => {
    //autocompleteRef.current?.clear();
    autocompleteRef.current.setAddressText('');
    clearSearch();
  };

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        ref={autocompleteRef}
        placeholder='Search for a location'
        fetchDetails={true}
        GooglePlacesSearchQuery={{
          rankby: 'distance',
        }}
        onPress={(data, details = null) => { 
          handleLocationSearch(data.description);
        }}
        query={{
          key: googleapikey,
          language: 'ro', 
          types: 'establishment',
          location: '45.7494,21.2272',    // Coordinates for Timisoara
          radius: 50000,                  // 50 km radius
          rankby: 'distance',
        }}
        styles={{
          textInputContainer: {
            backgroundColor: 'white',
          },
          textInput: {
            height: 35,
            color: '#5d5d5d',
            fontSize: 17,
            paddingRight: 28,
          },
          predefinedPlacesDescription: {
            color: '#1faadb',
          },
        }}
      /> 
      <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
        <Text style={styles.clearButtonText}>✕</Text>
      </TouchableOpacity> 
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
  },
  clearButton: {
    position: 'absolute',
    right: 6,
    top: 3,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'black',
    fontSize: 20,
  },
});