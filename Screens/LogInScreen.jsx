import { View, StyleSheet, ActivityIndicator, Button, Text } from 'react-native';
import React, { useState } from 'react';
import { Firebase_Auth, db } from '../utils/FireBaseConfig';
import { TextInput } from 'react-native-gesture-handler';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';

const LogInScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const auth = Firebase_Auth;

    const signIn = async () => {
        setLoading(true);
        setError('');
        if (!email || !password) {
            setLoading(false);
            setError('Email and password are required.');
            return;
        }
        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response._tokenResponse.email);
            setEmail('');
            setPassword('');
        } catch (error) {
            console.log(error);
            setError('Sign in failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async () => {
        setLoading(true);
        setError('');
        if (!email || !password) {
            setLoading(false);
            setError('Email and password are required.');
            return;
        }
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            const userId = response.user.uid;
            const userRef = ref(db, `users/${userId}`);
            await set(userRef, {
                email: email,
                workCords: {},
                homeCords: {},
                carType: '',
                fuelType: '',
                gasConsumption: '',
                gasCost: '',
                pastRoutes: [],
            });
            setEmail('');
            setPassword('');
            alert('Check your email!');
        } catch (error) {
            console.log(error);
            setError('Registration failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput style={styles.textInput}
                value={email}
                placeholder='Email'
                autoCapitalize='none'
                keyboardType='email-address'
                onChangeText={(text) => setEmail(text)}
            />
            <TextInput style={styles.textInput}
                secureTextEntry={true}
                value={password}
                placeholder='Password'
                autoCapitalize='none'
                onChangeText={(text) => setPassword(text)}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {loading ? <ActivityIndicator size="large" color="#0000ff" />
                : <>
                    <Button title="Login" onPress={signIn} />
                    <Button title="Create account" onPress={signUp} />
                </>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: 'center',
    },
    textInput: {
        borderColor: '#ccc',
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
    backButton: {
        position: 'absolute',
        backgroundColor: '#2233ff',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 10,
        top: 30,
        right: 0,
    },
    backButtonText: {

    },
});

export default LogInScreen;
