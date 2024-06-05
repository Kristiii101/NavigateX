import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Alert, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import googleapikey from '../utils/google_api_key';
import imagePath from '../utils/imagePath';
import Modal from 'react-native-modal';

export default function UserScreen({ }) {
    const googlePlacesRef = useRef();
    const navigation = useNavigation();
    const route = useRoute();
    const { curLoc = {}, destinationCords = {} } = route.params || {};

    const [state, setState] = useState({
        time: 0,
        distance: 0,
        workCords: {},
        homeCords: {},
        setCords: {},
        pastRoutes: [],
        isModalVisible: false,
    });

    const { time, distance, workCords, homeCords, setCords, pastRoutes, isModalVisible } = state;
    const updateState = (data) => setState((state) => ({ ...state, ...data }));

    const setWork = () => {
        if (setCords.latitude && setCords.longitude) {
            updateState({
                workCords: {
                    latitude: setCords.latitude,
                    longitude: setCords.longitude
                },
                setCords: {}
            });
            googlePlacesRef.current.setAddressText('');
            Alert.alert('Work coordinates saved successfully');
            console.log(`Work coordinates saved: Latitude: ${workCords.latitude}, Longitude: ${workCords.longitude}`);
        } else {
            Alert.alert('Work location has been erased.  Please select a destination first!');
        }
    };

    const setHome = () => {
        if (setCords.latitude && setCords.longitude) {
            updateState({
                homeCords: {
                    latitude: setCords.latitude,
                    longitude: setCords.longitude
                },
                setCords: {}
            });
            googlePlacesRef.current.setAddressText('');
            Alert.alert('Home coordinates saved successfully');
            console.log(`Work coordinates saved: Latitude: ${homeCords.latitude}, Longitude: ${homeCords.longitude}`);
        } else {
            Alert.alert('Home location has been erased.  Please select a destination first!');
        }
    };

    const viewPastRoutes = () => {
        addPastRoute();
        updateState({ isModalVisible: true });
        // setTimeout(() => {
        //     updateState({ pastRoutes: [] });
        // }, 1000);
    };

    const closeModal = () => {
        updateState({ isModalVisible: false });
    };

    const addPastRoute = () => {
        const newRoute = {
            start: { latitude: curLoc.latitude, longitude: curLoc.longitude },
            destination: { latitude: destinationCords.latitude, longitude: destinationCords.longitude },
        };
        updateState({ pastRoutes: [...pastRoutes, newRoute] });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.navigate("MapScreen", {workCords, homeCords})}
                style={styles.backButton}
            >
                <Text style={styles.backButtonText}>Go Back</Text>
                <Image source={imagePath.imBackLogo} style={styles.icon} />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={setWork}
                style={styles.setWorkButton}
            >
                <View style={styles.iconTextRow}>
                    <Text style={styles.setWorkNHomeButtonText}>Set Work</Text>
                    <Image source={imagePath.imWork} style={styles.icon} />
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={setHome}
                style={styles.setHomeButton}
            >
                <View style={styles.iconTextRow}>
                    <Text style={styles.setWorkNHomeButtonText}>Set Home</Text>
                    <Image source={imagePath.imHome} style={styles.icon} />
                </View>
            </TouchableOpacity>

            <View style={styles.textContainer}>
                <Text style={styles.setText}>  Set work and home locations!</Text>
            </View>

            <TouchableOpacity
                style={styles.routesButton}
                onPress={viewPastRoutes}
            >
                <View style={styles.iconTextRow}>
                    <Image source={imagePath.imRoutes} style={styles.icon} />
                    <Text style={styles.setWorkNHomeButtonText}> View past routes </Text>
                </View>
            </TouchableOpacity>
            
            <GooglePlacesAutocomplete
                ref={googlePlacesRef}
                placeholder='Search and set HOME / WORK address'
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
                        setCords: {
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

            <Modal
                isVisible={isModalVisible}
                onBackdropPress={closeModal}
                style={styles.modal}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Past Routes</Text>
                    <FlatList
                        data={pastRoutes}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.routeItem}>
                                <Text>Start: {`Latitude: ${item.start.latitude}, Longitude: ${item.start.longitude}`}</Text>
                                <Text>Destination: {`Latitude: ${item.destination.latitude}, Longitude: ${item.destination.longitude}`}</Text>
                            </View>
                        )}
                    />
                    <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#656565',
    },
    backButton: {
        position: 'absolute',
        top: 30,
        right: 10,
        zIndex: 2,
        //backgroundColor: '#000088',
        backgroundColor: '#aa0000',
        borderRadius: 12,
        paddingVertical: 5,
        paddingHorizontal: 5,
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
        backgroundColor: '#228822',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
    },
    setWorkNHomeButtonText: {
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
        backgroundColor: '#228822',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 10,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
    },
    setText: {
        color: 'black',
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
    routesButton: {
        position: 'absolute',
        top: 30,
        left: 10,
        zIndex: 2,
        backgroundColor: '#000088',
        borderRadius: 12,
        paddingVertical: 5,
        paddingHorizontal: 4,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        borderTopLeftRadius: 17,
        borderTopRightRadius: 17,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    routeItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 10,
    },
    closeButton: {
        backgroundColor: '#228822',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
