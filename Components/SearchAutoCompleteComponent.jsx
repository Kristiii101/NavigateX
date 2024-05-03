import React, { useState } from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import googleapikey from '../utils/google_api_key';
import {StyleSheet ,View } from 'react-native';

export const SearchAutoCompleteComponent = ({handleLocationSearch}) => {
  
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (data) => {
    if (handleLocationSearch) {
      handleLocationSearch(data);
    }
  };
  
  return (
    <View style={styles.container}>
        <GooglePlacesAutocomplete
        placeholder='Search for a location'
        fetchDetails={true}
        GooglePlacesSearchQuery={{
            rankby: 'distance',
        }}
        onPress={(data, details = null) => { 
          handleSearch(data.description);
          //console.log(data.description);
        }}
        query={{
            key: googleapikey,
            language: 'en', 
            types: 'geocode',
        }}
        styles={{
            textInputContainer: {
            backgroundColor: 'grey',
            },
            textInput: {
            height: 38,
            color: '#5d5d5d',
            fontSize: 16,
            },
            predefinedPlacesDescription: {
            color: '#1faadb',
            },
        }}
        /> 
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 40, // Adjust based on your header's height
      left: 20,
      right: 20,
      zIndex: 1,
    },
    input: {
      height: 40,
      backgroundColor: '#fff',
      borderRadius: 5,
      padding: 10,
      fontSize: 18,
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowColor: '#000',
      shadowOffset: { height: 1, width: 1 },
      elevation: 3, // for Android shadow
    },
  });


