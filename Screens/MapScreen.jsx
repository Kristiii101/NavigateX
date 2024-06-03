import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Platform,Button } from 'react-native';
import MapView, { Marker, AnimatedRegion } from 'react-native-maps';
import googleapikey from '../utils/google_api_key';
import MapViewDirections from 'react-native-maps-directions';
import Loader from '../Components/Loader';
import { locationPermission, getCurrentLocation } from '../Components/getCurrentLocation';
import regions from '../utils/regions';
import imagePath from '../utils/imagePath';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.0018;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen = ({ }) => {
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
        heading: 0,
        routeStarted: 0 ////////// adaugat route daca e on sau off
    })

    const { curLoc, time, distance, destinationCords, isLoading, coordinate, heading, routeStarted } = state
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

        // Verificare dacă locația curentă este aproape de destinație
        if (Object.keys(destinationCords).length > 0) {
            const distanceToDestination = getDistanceFromLatLonInMeters(
                curLoc.latitude,
                curLoc.longitude,
                destinationCords.latitude,
                destinationCords.longitude
            );
            if (distanceToDestination < 20) {
                Alert.alert('You have arrived at your destination!');
                updateState({ routeStarted: 0 });
            }
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            getLiveLocation()
        }, 100);                                   // change interval to 100 for faster location update
        return () => clearInterval(interval)
    }, [])

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

    const onDestination = () => {
        mapRef.current.animateToRegion({
            latitude: destinationCords.latitude,
            longitude: destinationCords.longitude,
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
            distance: 0,
            routeStarted: 0
        });
    }

    const startRoute = () => {
        updateState({
            routeStarted: 1
        });
        mapRef.current.animateToRegion({
            latitude: curLoc.latitude,
            longitude: curLoc.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        })
        console.log('Route started');
      };

      // Funcție pentru calcularea distanței dintre două coordonate în metri
        const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
            var R = 6371; // Radius of the earth in km
            var dLat = deg2rad(lat2 - lat1); // deg2rad below
            var dLon = deg2rad(lon2 - lon1);
            var a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c; // Distance in km
            return d * 1000; // Distance in meters
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
            {Object.keys(destinationCords).length > 0 && (
                <TouchableOpacity
                    style={styles.startRouteButton}
                    onPress={startRoute}
                >
                    <Text style={styles.startRouteButtonText}>Start route?</Text>    
                </TouchableOpacity>
            )}

            

            {routeStarted !== 0 && distance !== 0 && time !== 0 && (<View style={{position: 'absolute' ,alignItems: 'center', top: 52, left: 10 ,marginVertical: 25, zIndex: 1, backgroundColor: '#00ff00', paddingVertical: 5, paddingHorizontal: 10, color: 'blue', borderRadius: 100,}}>
                <Text style={{color: '#ff00ff'}}>Time left: {time.toFixed(0)} minutes</Text>
                <Text style={{color: '#ff00ff'}}>Distance left: {distance.toFixed(0)} Km</Text>
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
                        right: 0
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
    },
    startRouteButton: {
        position: 'absolute',
        bottom: 80, // Adjust as needed
        left: '50%',
        transform: [{ translateX: -50 }],
        zIndex: 2,
        backgroundColor: 'green',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    startRouteButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },
});

export default MapScreen;