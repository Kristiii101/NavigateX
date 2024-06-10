import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, Alert, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import googleapikey from '../utils/google_api_key';
import imagePath from '../utils/imagePath';
import Modal from 'react-native-modal';
import { Firebase_Auth, db } from '../utils/FireBaseConfig';
import { ref, set, get } from 'firebase/database';

export default function UserScreen({ }) {
    const googlePlacesRef = useRef();
    const navigation = useNavigation();
    const [carType, setCarType] = useState('');
    const [fuelType, setFuelType] = useState('');
    const [gasConsumption, setGasConsumption] = useState('');
    const [gasCost, setGasCost] = useState('');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedItem, setExpandedItem] = useState(null);

    const [state, setState] = useState({
        time: 0,
        distance: 0,
        workCords: {},
        homeCords: {},
        setCords: {},
        pastRoutes: [],
        isRoutesModalVisible: false,
        isCarModalVisible: false,
        workLocationString: '',
        homeLocationString: ''
    });

    const { time, distance, workCords, homeCords, setCords, pastRoutes, isRoutesModalVisible, isCarModalVisible, workLocationString, homeLocationString } = state;
    const updateState = (data) => setState((state) => ({ ...state, ...data }));

    useEffect (() => {
        const fetchUserData = async () => {
            const currentUser = Firebase_Auth.currentUser;
            console.log(`currentUser: ${JSON.stringify(currentUser.email)}`);
            if (currentUser) {
                setUser(currentUser);
                const userRef = ref(db, `users/${currentUser.uid}`);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setCarType(userData.carType || '');
                    setFuelType(userData.fuelType || '');
                    setGasConsumption(userData.gasConsumption || '');
                    setGasCost(userData.gasCost || '');
                    updateState({
                        workCords: userData.workCords || {},
                        homeCords: userData.homeCords || {},
                        pastRoutes: userData.pastRoutes || [],
                        workLocationString: userData.workLocationString || '',
                        homeLocationString: userData.homeLocationString || ''
                    });
                }
            }
            setLoading(false);
        };
        fetchUserData();
    }, []);

    const saveUserData = async () => {
        if (user) {
            const userRef = ref(db, `users/${user.uid}`);
            const snapshot = await get(userRef);
            const existingData = snapshot.exists() ? snapshot.val() : {};
            
            const updatedData = {
                workCords: state.workCords || existingData.workCords || {},
                homeCords: state.homeCords || existingData.homeCords || {},
                carType: carType || existingData.carType || '',
                fuelType: fuelType || existingData.fuelType || '',
                gasConsumption: gasConsumption || existingData.gasConsumption || '',
                gasCost: gasCost || existingData.gasCost || '',
                pastRoutes: existingData.pastRoutes || [],
                workLocationString: state.workLocationString || existingData.workLocationString || '',
                homeLocationString: state.homeLocationString || existingData.homeLocationString || ''
            };
            await set(userRef, updatedData);
            console.log('User data saved successfully!');
        }
    };

    const saveCoords = async (cords) => {
        if (user) {
            const userRef = ref(db, `users/${user.uid}`);
            const snapshot = await get(userRef);
            const existingData = snapshot.exists() ? snapshot.val() : {};
            
            const updatedData = {
                workCords: cords.workCords || existingData.workCords || {},
                homeCords: cords.homeCords || existingData.homeCords || {},
                carType: carType || existingData.carType || '',
                fuelType: fuelType || existingData.fuelType || '',
                gasConsumption: gasConsumption || existingData.gasConsumption || '',
                gasCost: gasCost || existingData.gasCost || '',
                pastRoutes: existingData.pastRoutes || [],
                workLocationString: cords.workLocationString || existingData.workLocationString || '',
                homeLocationString: cords.homeLocationString || existingData.homeLocationString || ''
            };
            await set(userRef, updatedData);
            console.log('User data saved successfully!');
        }
    };

    const setWork = async () => {
        if (setCords.latitude && setCords.longitude) {
            const cords = {
                workCords: {
                    latitude: setCords.latitude,
                    longitude: setCords.longitude
                },
                setCords: {},
                homeCords: homeCords,
                workLocationString: setCords.locationString
            }
            updateState(cords);
            await saveCoords(cords);
            console.log('Work Coordinates Updated:', cords.workCords);
            googlePlacesRef.current.setAddressText('');
            Alert.alert('Work coordinates saved successfully');
        } else {
            Alert.alert('Please select a destination first!');
        }
    };

    const setHome = async () => {
        if (setCords.latitude && setCords.longitude) {
            const cords = {
                homeCords: {
                    latitude: setCords.latitude,
                    longitude: setCords.longitude
                },
                setCords: {},
                workCords: workCords,
                homeLocationString: setCords.locationString
            }
            updateState(cords);
            await saveCoords(cords);
            console.log('Home Coordinates Updated:', setCords);
            googlePlacesRef.current.setAddressText('');
            Alert.alert('Home coordinates saved successfully');
        } else {
            Alert.alert('Please select a destination first!');
        }
    };

    const viewPastRoutes = async () => {
        if (user) {
            const userRef = ref(db, `users/${user.uid}/pastRoutes`);
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                const routesData = snapshot.val();
                const formattedRoutes = Object.values(routesData).map(route => {
                    const fuelConsumed = ((route.distance * parseFloat(gasConsumption)) / 100).toFixed(2);
                    const moneySpent = (fuelConsumed * parseFloat(gasCost)).toFixed(2);
                    return {
                        ...route,
                        start: {
                            latitude: route.start.latitude.toFixed(2),
                            longitude: route.start.longitude.toFixed(2),
                        },
                        destination: {
                            latitude: route.destination.latitude.toFixed(2),
                            longitude: route.destination.longitude.toFixed(2),
                            locationString: route.locationString // Ensure locationString is included
                        },
                        time: route.time.toFixed(2),  // convert to minutes
                        distance: route.distance.toFixed(2),  // convert to kilometers
                        fuelConsumed,
                        moneySpent,
                    };
                });
                updateState({ pastRoutes: formattedRoutes, isRoutesModalVisible: true });
            } else {
                Alert.alert('No past routes found');
            }
        }
    };

    const carInfo = () => {
        updateState({ isCarModalVisible: true });
    };

    const closeModal = () => {
        updateState({ isRoutesModalVisible: false });
        updateState({ isCarModalVisible: false });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.navigate("MapScreen", { workCords, homeCords, userId: user.uid })}
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

            <TouchableOpacity
                style={styles.carLogoButton}
                onPress={carInfo}
            >
                <View style={styles.iconTextRow}>
                    <Image source={imagePath.imCarLogo} style={styles.icon} />
                    <Text style={styles.setWorkNHomeButtonText}> Car info </Text>
                </View>
            </TouchableOpacity>

            <View style={styles.Lgoos}>
                <Image source={imagePath.imLogo} style={styles.logo} />
            </View>

            <TouchableOpacity
                onPress={() => Firebase_Auth.signOut()}
                style={styles.logOutButton}
            >
                <View style={styles.iconTextRow}>
                    <Text style={styles.logOutButtonText}>Log out</Text>
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
                    const locationString = `${details.name}, ${details.address_components.find(component => component.types.includes('locality')).long_name}, ${details.address_components.find(component => component.types.includes('country')).short_name}`;

                    updateState({
                        setCords: {
                            latitude: lat,
                            longitude: lng,
                            locationString: locationString
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
                isVisible={isRoutesModalVisible}
                onBackdropPress={closeModal}
                style={styles.modal}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Past Routes</Text>
                    <FlatList
                        data={pastRoutes}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity onPress={() => setExpandedItem(expandedItem === index ? null : index)}>
                                <View style={styles.routeItem}>
                                    <Text>Destination: {item.destination.locationString}</Text>
                                    {expandedItem === index && (
                                        <>
                                            <Text>Time: {`${item.time} Minutes`}</Text>
                                            <Text>Distance: {`${item.distance} KM`}</Text>
                                            <Text>Fuel Consumed: {`${item.fuelConsumed} Liters`}</Text>
                                            <Text>Spent on the trip: {`${item.moneySpent} RON`}</Text>
                                        </>
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}
                    />

                    <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <Modal
                isVisible={isCarModalVisible}
                onBackdropPress={closeModal}
                style={styles.modal}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Car Info</Text>
                    
                    <Text style={styles.label}>Choose Car Type:</Text>
                    <Picker
                        selectedValue={carType}
                        onValueChange={(itemValue) => setCarType(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select car type" value="" />
                        <Picker.Item label="Car" value="Car" />
                        <Picker.Item label="Motorbike" value="Motorbike" />
                    </Picker>

                    <Text style={styles.label}>Choose Fuel Type:</Text>
                    <Picker
                        selectedValue={fuelType}
                        onValueChange={(itemValue) => setFuelType(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select fuel type" value="" />
                        <Picker.Item label="Gasoline" value="Gasoline" />
                        <Picker.Item label="Diesel" value="Diesel" />
                        <Picker.Item label="Gas" value="Gas" />
                    </Picker>

                    <Text style={styles.label}>Fuel Consumption (liters per 100km):</Text>
                    <TextInput
                        style={styles.input}
                        value={gasConsumption}
                        onChangeText={setGasConsumption}
                        keyboardType="numeric"
                        placeholder="Enter fuel consumption"
                    />

                    <Text style={styles.label}>Fuel Cost/Liter in RON:</Text>
                    <TextInput
                        style={styles.input}
                        value={gasCost}
                        onChangeText={setGasCost}
                        keyboardType="numeric"
                        placeholder="Enter fuel cost"
                    />

                    <TouchableOpacity onPress={() => { saveUserData(); closeModal(); }} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>

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
        backgroundColor: '#dedede',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 30,
        right: 10,
        zIndex: 2,
        backgroundColor: 'white',
        borderRadius: 12,
        paddingVertical: 5,
        paddingHorizontal: 5,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
    },
    backButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
    },
    setWorkButton: {
        position: 'absolute',
        bottom: 70,
        left: 12,
        zIndex: 2,
        backgroundColor: '#22ee22',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 10,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
    },
    setWorkNHomeButtonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
    },
    setHomeButton: {
        position: 'absolute',
        bottom: 70,
        right: 12,
        zIndex: 2,
        backgroundColor: '#22ee22',
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
    Lgoos: {
        top: 20,
        left: 120,
    },
    icon: {
        width: 20,
        height: 25,
        marginLeft: 5,
    },
    logo: {
        width: 174,
        height: 153,
    },
    routesButton: {
        position: 'absolute',
        bottom: 120,
        left: 10,
        zIndex: 2,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingVertical: 5,
        paddingRight: 235,
        paddingLeft: 5,
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
    logOutButton:{
        position: 'absolute',
        backgroundColor: '#ff3333',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 20,
        top: 25,
        left: 10,
    },
    logOutButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    carLogoButton: { 
        position: 'absolute',
        bottom: 160,
        left: 10,
        zIndex: 2,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingVertical: 5,
        paddingRight: 296,
        paddingLeft: 5,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: 'row',
    },
    label: {
        alignSelf: 'flex-start',
        marginBottom: 4,
        color: '#333',
    },
    picker: {
        height: 50,
        width: 200,
        marginBottom: 12,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        width: 200,
        paddingHorizontal: 10,
        marginBottom: 12,
    },
    saveButton: {
        backgroundColor: '#228822',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

