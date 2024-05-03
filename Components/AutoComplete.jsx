import React from "react";
import { Text, View, StyleSheet, Dimensions, TextInput } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import googleapikey from "../utils/google_api_key";

const AutoComplete = () => {
    return (
        <View>   
            <GooglePlacesAutocomplete
            placeholder="Search for a location"
            styles={textinputstyle}
            debounce={400}
            query={{
                key: googleapikey,
                language: 'en',
            }}
            style={{}}
            onPress={item => {console.log(item);}}
            />
        </View>
    );
};

export default AutoComplete;
const textinputstyle = StyleSheet.create ({
    container: {
        flex: 1,
    },
    textInputContainer: {
        flexDirection: 'row',
    },
    textInput: {
        backgroundColor: '#FFFFFF',
        height: 44,
        borderRadius: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        fontSize: 15,
        flex: 1,
    }
});

