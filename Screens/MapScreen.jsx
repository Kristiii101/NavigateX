import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Platform, Alert } from 'react-native';
import MapView, { Marker, AnimatedRegion } from 'react-native-maps';
import googleapikey from '../utils/google_api_key';
import MapViewDirections from 'react-native-maps-directions';
import Loader from '../Components/Loader';
import { getCurrentLocation } from '../Components/getCurrentLocation';
import regions from '../utils/regions';
import imagePath from '../utils/imagePath';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ref, push, set, get } from 'firebase/database';
import { db, Firebase_Auth } from '../utils/FireBaseConfig';

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.0018;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen = () => {
    const mapRef = useRef();
    const markerRef = useRef();
    const googlePlacesRef = useRef();
    const navigation = useNavigation();
    const [user, setUser] = useState(null);

    const [state, setState] = useState({
        curLoc: {
            ...regions,
        },
        destinationCords: {},
        isLoading: false,
        coordinate: new AnimatedRegion({
            ...regions,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        }),
        time: 0,
        distance: 0,
        heading: 0,
        routeStarted: 0,
        workCords: {},
        homeCords: {},
        workLocationString: '',
        homeLocationString: '',
        userId: Firebase_Auth.currentUser ? Firebase_Auth.currentUser.uid : null,
        locationString: '',
    });

    const { curLoc, time, distance, destinationCords, isLoading, coordinate, heading, routeStarted, userId, workCords, homeCords, workLocationString, homeLocationString, locationString } = state;
    const updateState = (data) => setState((state) => ({ ...state, ...data }));

    useFocusEffect(
        useCallback(() => {
            const fetchUserData = async () => {
                const currentUser = Firebase_Auth.currentUser;
                console.log(`currentUser: ${JSON.stringify(currentUser.email)}`);
                if (currentUser) {
                    setUser(currentUser);
                    const userRef = ref(db, `users/${currentUser.uid}`);
                    const snapshot = await get(userRef);
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        updateState({
                            workCords: userData.workCords || {},
                            homeCords: userData.homeCords || {},
                            workLocationString: userData.workLocationString || '',
                            homeLocationString: userData.homeLocationString || '',
                        });
                    }
                }
            };
            fetchUserData();
            getLiveLocation();
        }, [])
    );

    const getLiveLocation = async () => {
        const { latitude, longitude, heading } = await getCurrentLocation();
        animate(latitude, longitude);
        updateState({
            heading: heading,
            curLoc: { latitude, longitude },
            coordinate: new AnimatedRegion({
                latitude: latitude,
                longitude: longitude,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA
            })
        });

        if (Object.keys(destinationCords).length > 0) {
            const distanceToDestination = getDistanceFromLatLonInMeters(
                curLoc.latitude,
                curLoc.longitude,
                destinationCords.latitude,
                destinationCords.longitude
            );
            if (distanceToDestination < 50) {
                Alert.alert('You have arrived at your destination!');
                updateState({ routeStarted: 0 });
            }
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            getLiveLocation();
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const animate = (latitude, longitude) => {
        const newCoordinate = { latitude, longitude };
        if (Platform.OS === 'android') {
            if (markerRef.current) {
                markerRef.current.animateMarkerToCoordinate(newCoordinate, 7000);
            }
        } else {
            coordinate.timing(newCoordinate).start();
        }
    };

    const onCenter = () => {
        mapRef.current.animateToRegion({
            latitude: curLoc.latitude,
            longitude: curLoc.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        });
    };

    const onDestination = () => {
        mapRef.current.animateToRegion({
            latitude: destinationCords.latitude,
            longitude: destinationCords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        });
    };

    const fetchTime = (d, t) => {
        updateState({
            distance: d,
            time: t
        });
    };

    const clearDestination = () => {
        googlePlacesRef.current.setAddressText('');
        updateState({
            destinationCords: {},
            time: 0,
            distance: 0,
            routeStarted: 0
        });
        mapRef.current.animateToRegion({
            latitude: curLoc.latitude,
            longitude: curLoc.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        });
    };

    const startRoute = async () => {
        if (!userId) {
            Alert.alert('Error', 'User ID not found.');
            return;
        }

        updateState({
            routeStarted: 1
        });

        const newRouteRef = push(ref(db, `users/${userId}/pastRoutes`));
        await set(newRouteRef, {
            start: { latitude: curLoc.latitude, longitude: curLoc.longitude },
            destination: { latitude: destinationCords.latitude, longitude: destinationCords.longitude },
            distance: distance,
            time: time,
            locationString: locationString
        });

        mapRef.current.animateToRegion({
            latitude: curLoc.latitude,
            longitude: curLoc.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        });
        console.log('Route started');
    };

    const setDestinationToWork = () => {
        if (workCords && workCords.latitude && workCords.longitude) {
            updateState({
                destinationCords: {
                    latitude: workCords.latitude,
                    longitude: workCords.longitude,
                },
                locationString: workLocationString
            });
            googlePlacesRef.current.setAddressText('Work');
            console.log(`Navigating to work: Latitude: ${workCords.latitude}, Longitude: ${workCords.longitude}`);
        } else {
            Alert.alert('Work coordinates not set, please set them from the User page!');
        }
    };

    const setDestinationToHome = () => {
        if (homeCords && homeCords.latitude && homeCords.longitude) {
            updateState({
                destinationCords: {
                    latitude: homeCords.latitude,
                    longitude: homeCords.longitude,
                },
                locationString: homeLocationString
            });
            googlePlacesRef.current.setAddressText('Home');
            console.log(`Navigating to home: Latitude: ${homeCords.latitude}, Longitude: ${homeCords.longitude}`);
        } else {
            Alert.alert('Home coordinates not set, please set them from the User page!');
        }
    };

    const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
        var R = 6371;
        var dLat = deg2rad(lat2 - lat1); 
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d * 1000;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    return (
        <View style={styles.container}>
            <GooglePlacesAutocomplete
                ref={googlePlacesRef}
                placeholder='Search for a location'
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
                    const location = {
                        name: details.name,
                        city: details.address_components.find(component => component.types.includes('locality')).long_name,
                        country: details.address_components.find(component => component.types.includes('country')).short_name
                    };
                    const locationString = `${location.name}, ${location.city}, ${location.country}`;
                    console.log(locationString);

                    updateState({
                        destinationCords: {
                            latitude: lat,
                            longitude: lng,
                        },
                        locationString
                    });
                }}
                query={{
                    key: googleapikey,
                    language: 'en',
                    types: 'establishment',
                    location: '45.7494,21.2272',
                    radius: 50000,
                    rankby: 'distance',
                }}
                nearbyPlacesAPI='GooglePlacesSearch'
                debounce={300}
                styles={{
                    container: {
                        flex: 0,
                        position: 'absolute',
                        top: 78,
                        width: '100%',
                        zIndex: 2,
                    },
                    textInputContainer: {
                        backgroundColor: 'transparent',
                        borderTopWidth: 0,
                        borderBottomWidth: 0,
                        height: 50,
                        marginHorizontal: 0,
                    },
                    textInput: {
                        height: 38,
                        color: 'black',
                        fontSize: 16,
                        borderRadius: 8,
                        paddingLeft: 10,
                        backgroundColor: '#F1F1F1',
                        marginHorizontal: 10,
                    },
                    listView: {
                        backgroundColor: 'white',
                        marginHorizontal: 5,
                    },
                    row: {
                        backgroundColor: '#FFFFFF',
                        padding: 10,
                        height: 44,
                        flexDirection: 'row',
                    },
                    separator: {
                        height: 0,
                        backgroundColor: '#c8c7cc',
                    },
                    description: {
                        color: '#004',
                    },
                }}
            />

            {Object.keys(destinationCords).length > 0 && (
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearDestination}
                >
                    <Text style={styles.clearButtonText}>X</Text>
                </TouchableOpacity>
            )}
            {Object.keys(destinationCords).length > 0 && (
                <TouchableOpacity
                    style={styles.startRouteButton}
                    onPress={startRoute}
                >
                    <Text style={styles.startRouteButtonText}>Start route?</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={{position:'absolute', zIndex: 2 ,top:28, left:15}}
                onPress={setDestinationToWork}
            >
                <Image source={imagePath.imSuitcase} style={{width: 55, height: 50}} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.userButton}
                onPress={() => navigation.navigate("UserScreen")}
            >
                <Image source={imagePath.imUser} style={styles.icon} />
            </TouchableOpacity>

            <TouchableOpacity
                style={{position:'absolute', zIndex: 2 ,top:28, right:15}}
                onPress={setDestinationToHome}
            >
                <Image source={imagePath.imHouse} style={{width: 55, height: 50}} />
            </TouchableOpacity>

            {routeStarted !== 0 && distance !== 0 && time !== 0 && (
                <View style={{ position: 'absolute', alignItems: 'center', bottom: 50, left: 120, marginVertical: 25, zIndex: 2, backgroundColor: '#0b81ff', paddingVertical: 5, paddingHorizontal: 10, color: 'blue', borderRadius: 100, }}>
                    <Text style={{ color: '#000', fontSize: 15, }}>Time left: {time.toFixed(2)} minutes</Text>
                    <Text style={{ color: '#000', fontSize: 15, }}>Distance left: {distance.toFixed(2)} Km</Text>
                </View>
            )}

            <View style={{ flex: 1 }}>
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFill}
                    initialRegion={{
                        ...curLoc,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                    }}
                >

                    <Marker.Animated
                        ref={markerRef}
                        coordinate={coordinate}
                    >
                        <Image
                            source={imagePath.imCar}
                            style={{
                                width: 20,
                                height: 20,
                                transform: [{ rotate: `${heading}deg` }]
                            }}
                            resizeMode="contain"
                        />
                    </Marker.Animated>

                    {Object.keys(destinationCords).length > 0 && (<Marker
                        coordinate={destinationCords}
                        image={imagePath.imMarker}
                    />)}

                    {Object.keys(destinationCords).length > 0 && (<MapViewDirections
                        origin={curLoc}
                        destination={destinationCords}
                        apikey={googleapikey}
                        strokeWidth={6}
                        strokeColor="#77f"
                        optimizeWaypoints={true}
                        onStart={(params) => {
                            console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
                        }}
                        onReady={result => {
                            console.log(`Distance: ${result.distance} km`)
                            console.log(`Duration: ${result.duration} min.`)
                            fetchTime(result.distance, result.duration),
                                mapRef.current.fitToCoordinates(result.coordinates, {
                                    edgePadding: {
                                        right: 30,
                                        bottom: 100,
                                        left: 30,
                                        top: 100,
                                    },
                                });
                        }}
                        onError={(errorMessage) => {
                            console.log('GOT AN ERROR');
                        }}
                    />)}
                </MapView>
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                    }}
                    onPress={onCenter}
                >
                    <Image source={imagePath.imIndicator} />
                </TouchableOpacity>

                {Object.keys(destinationCords).length > 0 && (
                    <TouchableOpacity
                        style={{
                            position: 'absolute',
                            bottom: 10,
                            left: 8
                        }}
                        onPress={onDestination}
                    >
                        <Image source={imagePath.imMarker} /> 
                    </TouchableOpacity>
                )}
            </View>
            <Loader isLoading={isLoading} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingTop: 22,
    },
    clearButton: {
        position: 'absolute',
        top: 80, 
        right: 8,
        zIndex: 2,
        backgroundColor: 'red',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },
    clearButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    startRouteButton: {
        position: 'absolute',
        bottom: 80,
        left: '50%',
        transform: [{ translateX: -50 }],
        zIndex: 2,
        backgroundColor: '#0b81ff',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    startRouteButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    workButton: {
        position: 'absolute',
        top: 30,
        left: 12,
        zIndex: 2,
        backgroundColor: '#0b81ff',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
    },
    homeButton: {
        position: 'absolute',
        top: 30,
        right: 12,
        zIndex: 2,
        backgroundColor: '#0b81ff',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 15,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
    },
    userButton: {
        position: 'absolute',
        top: 30,
        left: 150,
        right: 150,
        zIndex: 2,
        backgroundColor: 'blue',
        borderRadius: 12,
        paddingVertical: 10,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
    },
    userButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    icon: {
        width: 20,
        height: 25,
    },
});

export default MapScreen;
