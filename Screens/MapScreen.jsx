import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Platform } from 'react-native';
import MapView, { Marker, AnimatedRegion } from 'react-native-maps';
import googleapikey from '../utils/google_api_key';
import MapViewDirections from 'react-native-maps-directions';
import Loader from '../Components/Loader';
import { locationPermission, getCurrentLocation } from '../Components/getCurrentLocation ';
import regions from '../utils/regions';
import imagePath from '../utils/imagePath';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.0018;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen = ({ navigation }) => {
    const mapRef = useRef()
    const markerRef = useRef()
    const googlePlacesRef = useRef();

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
        heading: 0

    })

    const { curLoc, time, distance, destinationCords, isLoading, coordinate, heading } = state
    const updateState = (data) => setState((state) => ({ ...state, ...data }));

    useEffect(() => {
        getLiveLocation()
    }, [])

    const getLiveLocation = async () => {
        const locPermissionDenied = await locationPermission()
        if (locPermissionDenied) {
            const { latitude, longitude, heading } = await getCurrentLocation()
            //console.log("get live location after 4 second",heading)
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
            })
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            getLiveLocation()
        }, 6000);
        return () => clearInterval(interval)
    }, [])

    // const onPressLocation = () => {
    //     navigation.navigate('chooseLocation', { getCordinates: fetchValue })
    // }

    const fetchValue = (data) => {
        console.log("this is data", data)
        updateState({
            destinationCords: {
                latitude: data.destinationCords.latitude,
                longitude: data.destinationCords.longitude,
            }
        })
    }

    const animate = (latitude, longitude) => {
        const newCoordinate = { latitude, longitude };
        if (Platform.OS == 'android') {
            if (markerRef.current) {
                markerRef.current.animateMarkerToCoordinate(newCoordinate, 7000);
            }
        } else {
            coordinate.timing(newCoordinate).start();
        }
    }

    const onCenter = () => {
        mapRef.current.animateToRegion({
            latitude: curLoc.latitude,
            longitude: curLoc.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        })
    }

    const fetchTime = (d, t) => {
        updateState({
            distance: d,
            time: t
        })
    }

    const clearDestination = () => {
        googlePlacesRef.current.setAddressText('');
        updateState({
            destinationCords: {},
            time: 0,
            distance: 0
        });
    }

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
                    updateState({
                        destinationCords: {
                            latitude: lat,
                            longitude: lng,
                        }
                    })
                }}
                query={{
                    key: googleapikey,
                    language: 'en',
                    types: 'establishment',
                    location: '45.7494,21.2272',    // Coordinates for Timisoara
                    radius: 50000,                  // 50 km radius
                    rankby: distance,
                }}
                nearbyPlacesAPI='GooglePlacesSearch'
                debounce={300}
                styles={{
                    container: {
                        flex: 0,
                        position: 'absolute',
                        top: 30,
                        width: '100%',
                        zIndex: 2
                    },
                    listView: { backgroundColor: 'white' }
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

            {distance !== 0 && time !== 0 && (<View style={{position: 'absolute' ,alignItems: 'center', top: 50, left: 140 ,marginVertical: 25, zIndex: 1, backgroundColor: 'blue' }}>
                <Text>Time left: {time.toFixed(0)} minutes</Text>
                <Text>Distance left: {distance.toFixed(0)} Km</Text>
            </View>)}
            <View style={{ flex: 1 }}>
                <MapView
                //showsUserLocation
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
                                transform: [{rotate: `${heading}deg`}]
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
                        strokeColor="green"
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
                                         bottom: 300,
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
                        right: 0
                    }}
                    onPress={onCenter}
                >
                    <Image source={imagePath.imIndicator} />
                </TouchableOpacity>
            </View>
            <Loader isLoading={isLoading} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    clearButton: {
        position: 'absolute',
        top: 38, // Adjust as needed
        right: 8, // Adjust as needed
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
    inpuStyle: {
        backgroundColor: 'white',
        borderRadius: 4,
        borderWidth: 1,
        alignItems: 'center',
        height: 48,
        justifyContent: 'center',
        marginTop: 16
    }
});


export default MapScreen;