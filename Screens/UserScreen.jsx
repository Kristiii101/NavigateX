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

const UserScreen = () => {
    const googlePlacesRef = useRef();
    const navigation = useNavigation();
    const [carType, setCarType] = useState('');
    const [fuelType, setFuelType] = useState('');
    const [gasConsumption, setGasConsumption] = useState('');
    const [gasCost, setGasCost] = useState('');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedItem, setExpandedItem] = useState(null);
    const [lastRoute, setLastRoute] = useState(null);

    const [state, setState] = useState({
        workCords: {},
        homeCords: {},
        setCords: {},
        pastRoutes: [],
        isRoutesModalVisible: false,
        isCarModalVisible: false,
    });

    const { workCords, homeCords, setCords, pastRoutes, isRoutesModalVisible, isCarModalVisible } = state;
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
                    const routesArray = userData.pastRoutes ? Object.values(userData.pastRoutes) : [];
                    if (routesArray.length > 0) {
                        const lastRoute = routesArray[routesArray.length - 1];
                        setLastRoute({
                            ...lastRoute,
                            time: lastRoute.time.toFixed(2),
                            distance: lastRoute.distance.toFixed(2),
                            locationString: lastRoute.locationString
                        });
                    }
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
                            locationString: route.locationString
                        },
                        time: route.time.toFixed(2),
                        distance: route.distance.toFixed(2), 
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

    const lastRouteArray = lastRoute ? [lastRoute] : [];

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => navigation.navigate("MapScreen")}
                style={{position:'absolute', top:20, left: 15}}
            >
                <Image source={imagePath.imBack} style={{width: 40, height: 40}} />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={setWork}
                style={styles.setWorkButton}
            >
                <View style={styles.iconTextRow}>
                    <Text style={styles.setWorkNHomeButtonText}>Set Work</Text>
                    <Image source={imagePath.imSuitcase} style={styles.icon2} />
                </View>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={setHome}
                style={styles.setHomeButton}
            >
                <View style={styles.iconTextRow}>
                    <Text style={styles.setWorkNHomeButtonText}>Set Home</Text>
                    <Image source={imagePath.imHouse} style={styles.icon2} />
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

            <View style={styles.logoIcon}>
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
                        bottom: 12,
                        width: '100%',
                        zIndex: 2,
                    },
                    textInputContainer: {
                        backgroundColor: 'transparent',
                        borderTopWidth: 0,
                        borderBottomWidth: 0,
                        height: 50,
                        marginHorizontal: 10,
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

            <View style={styles.lastRouteContainer}>
                <Text style={styles.lastRouteTitle}>Your last trip</Text>
                <FlatList
                    data={lastRouteArray}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.routeItem}>
                            <Text style={styles.lastRouteText}>Took: {`${item.time} Minutes`}</Text>
                            <Text style={styles.lastRouteText}>You traveled: {`${item.distance} KM`}</Text>
                            <Text style={styles.lastRouteText}>And you went to: {item.locationString}</Text>
                        </View>
                    )}
                />
            </View>

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
        backgroundColor: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    setWorkButton: {
        position: 'absolute',
        bottom: 70,
        left: 12,
        zIndex: 2,
        backgroundColor: 'black',
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
        right: 12,
        zIndex: 2,
        backgroundColor: 'black',
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
    logoIcon: {
        top: 20,
        left: 120,
    },
    icon: {
        width: 25,
        height: 25,
        marginLeft: 5,
    },
    icon2: {
        width: 30,
        height: 30,
        marginLeft: 5,
    },
    logo: {
        width: 174,
        height: 153,
    },
    routesButton: {
        position: 'absolute',
        top: 170,
        left: 10,
        zIndex: 2,
        backgroundColor: '#0b81ff',
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
        backgroundColor: '#0b81ff',
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
        backgroundColor: 'black',
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 15,
        top: 25,
        right: 20,
    },
    logOutButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },
    carLogoButton: { 
        position: 'absolute',
        top: 210,
        left: 10,
        zIndex: 2,
        backgroundColor: '#0b81ff',
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
        backgroundColor: '#0b81ff',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 20,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    lastRouteContainer: {
        backgroundColor: '#007bff',
        borderRadius: 15,
        padding: 15,
        margin: 10,
        alignItems: 'center',
        top: 220,
    },
    lastRouteTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },
    lastRouteText: {
        color: '#000',
        fontSize: 15,
        marginTop: 5,
    },
});

export default UserScreen;