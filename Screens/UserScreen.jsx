import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import googleapikey from '../utils/google_api_key';
import imagePath from '../utils/imagePath';

export default function UserScreen() {
    const googlePlacesRef = useRef();
    const navigation = useNavigation();

    const [state, setState] = useState({
        time: 0,
        distance: 0,
        workCords: {},
        homeCords: {},
        destinationCords: {},
    });

    const { time, distance, workCords, homeCords, destinationCords } = state;
    const updateState = (data) => setState((state) => ({ ...state, ...data }));

    const onPress = () => {
        navigation.goBack();
    };

    const setWork = () => {
        if (destinationCords.latitude && destinationCords.longitude) {
            updateState({
                workCords: {
                    latitude: destinationCords.latitude,
                    longitude: destinationCords.longitude
                },
                destinationCords: {}
            });
            googlePlacesRef.current.setAddressText('');
            Alert.alert('Work coordinates saved successfully');
            console.log(`Work coordinates saved: Latitude: ${workCords.latitude}, Longitude: ${workCords.longitude}`);
        } else {
            Alert.alert('Please select a destination first');
        }
    };

    const setHome = () => {
        if (destinationCords.latitude && destinationCords.longitude) {
            updateState({
                homeCords: {
                    latitude: destinationCords.latitude,
                    longitude: destinationCords.longitude
                },
                destinationCords: {}
            });
            googlePlacesRef.current.setAddressText('');
            Alert.alert('Home coordinates saved successfully');
            console.log(`Work coordinates saved: Latitude: ${homeCords.latitude}, Longitude: ${homeCords.longitude}`);
        } else {
            Alert.alert('Please select a destination first');
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={onPress}
                style={styles.backButton}
            >
                <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={setWork}
                style={styles.setWorkButton}
            >
                <View style={styles.iconTextRow}>
                    <Text style={styles.setWorkButtonText}>Set Work</Text>
                    <Image source={imagePath.imWork} style={styles.icon} />
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={setHome}
                style={styles.setHomeButton}
            >
                <View style={styles.iconTextRow}>
                    <Text style={styles.setHomeButtonText}>Set Home</Text>
                    <Image source={imagePath.imHome} style={styles.icon} />
                </View>
            </TouchableOpacity>

            <View style={styles.textContainer}>
                <Text style={styles.setText}>  Set work and home locations!</Text>
            </View>
            
            <GooglePlacesAutocomplete
                ref={googlePlacesRef}
                placeholder='Set HOME / WORK'
                minLength={2}
                autoFocus={false}
                returnKeyType={'search'}
                listViewDisplayed='auto'
                fetchDetails={true}
                GooglePlacesSearchQuery={{
                    rankby: 'distance',
                }}
                onPress={(data, details = null) => {
                    const { lat, lng } = details.geometry.location;
                    updateState({
                        destinationCords: {
                            latitude: lat,
                            longitude: lng,
                        }
                    });
                }}
                query={{
                    key: googleapikey,
                    language: 'en',
                    types: 'establishment',
                    location: '45.7494,21.2272', // Coordinates for Timisoara
                    radius: 50000,               // 50 km radius
                    rankby: 'distance',
                }}
                nearbyPlacesAPI='GooglePlacesSearch'
                debounce={300}
                styles={{
                    container: {
                        flex: 0,
                        position: 'absolute',
                        bottom: 15,
                        width: '100%',
                        zIndex: 2,
                    },
                    listView: { backgroundColor: 'white' }
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: 30,
        left: 10,
        zIndex: 2,
        backgroundColor: 'blue',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 45,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
    },
    backButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    setWorkButton: {
        position: 'absolute',
        bottom: 70,
        left: 12,
        right: 280,
        zIndex: 2,
        backgroundColor: 'brown',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
    },
    setWorkButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    setHomeButton: {
        position: 'absolute',
        bottom: 70,
        left: 280,
        right: 12,
        zIndex: 2,
        backgroundColor: 'brown',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 10,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
    },
    setHomeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    setText: {
        color: 'green',
        fontSize: 18,
    },
    textContainer: {
        position: 'absolute',
        bottom: 72,
        left: 142,
        right: 130,
        paddingVertical: 0,
    },
    iconTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 20,
        height: 25,
        marginLeft: 5,
    },
});
