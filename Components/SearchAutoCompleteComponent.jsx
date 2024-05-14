import React, { useRef } from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import {StyleSheet ,View, TouchableOpacity, Button, Text } from 'react-native';
import googleapikey from '../utils/google_api_key';

export const SearchAutoCompleteComponent = ({handleLocationSearch, clearSearch}) => {

  const autocompleteRef = useRef(null);
  
  const handleSearch = (data) => {
    if (handleLocationSearch) {
      handleLocationSearch(data);
    }
  };

  const handleClearSearch = () => {
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
          handleSearch(data.description);
          //console.log(details.types);
        }}
        query={{
            key: googleapikey,
            language: 'ro', 
            //types: 'geocode',
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
        {/* <Button title="✕" onPress={handleClearSearch} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 25, // Adjust based on your header's height
      left: 15,
      right: 15,
      zIndex: 1,
    },
    input: {
      height: 40,
      backgroundColor: '#white',
      borderRadius: 5,
      padding: 10,
      fontSize: 18,
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowColor: '#000',
      shadowOffset: { height: 1, width: 1 },
      elevation: 3, // for Android shadow
    },
    clearButton: {
      position: 'absolute',
      right: 10,
      top: 10,
      color: 'black',
      backgroundColor: 'white',
      zIndex: 2,
    },
    listView: {
      backgroundColor: 'white',
    },
  });


