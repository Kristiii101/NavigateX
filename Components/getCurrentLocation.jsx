import { showMessage } from "react-native-flash-message"
import * as Location from 'expo-location';

export const getCurrentLocation = async () => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        }

        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        const { latitude, longitude, heading } = location.coords;

        return {
            latitude,
            longitude,
            heading,
        };
    } catch (error) {
        console.error(error);
    }
};

const showError = (message) => {
    showMessage({
        message,
        type: 'danger',
        icon: 'danger'
    })
}

const showSuccess = (message) => {
    showMessage({
        message,
        type: 'success',
        icon: 'success'
    })
}

export {
    showError,
    showSuccess
}