import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Image, Dimensions } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Firebase_Auth } from '../utils/FireBaseConfig';
import Icon from 'react-native-vector-icons/FontAwesome';
import imagePath from '../utils/imagePath';

const { width, height } = Dimensions.get('window');

const LogInScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigation = useNavigation();
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
            await signInWithEmailAndPassword(auth, email, password);
            setEmail('');
            setPassword('');
        } catch (error) {
            setError('Sign in failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Image source={imagePath.imBackGround} style={styles.backgroundImage} />
            <Text style={{fontSize: 28, fontWeight: 'bold', marginBottom: 20}}>Log in</Text>
            
            <Text style={{fontSize: 15}}>Email address</Text>
            <View style={styles.inputContainer}>
                <Icon name="envelope" size={20} style={styles.icon} />
                <TextInput
                    style={styles.textInput}
                    value={email}
                    placeholder='Email'
                    autoCapitalize='none'
                    keyboardType='email-address'
                    onChangeText={(text) => setEmail(text)}
                />
            </View>

            <Text style={{fontSize: 15}}>Password</Text>
            <View style={styles.inputContainer}>
                <Icon name="lock" size={20} style={styles.icon} />
                <TextInput
                    style={styles.textInput}
                    secureTextEntry={true}
                    value={password}
                    placeholder='Password'
                    autoCapitalize='none'
                    onChangeText={(text) => setPassword(text)}
                />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {loading ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : (
                <TouchableOpacity style={styles.button} onPress={signIn}>
                    <Text style={styles.buttonText}>Log in</Text>
                </TouchableOpacity>
            )}

            <View style={styles.linkContainer}>
                <Text style={{fontSize: 15}}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
                    <Text style={styles.linkText}>Register for free</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        marginVertical: 10,
        backgroundColor: '#f9f9f9',
    },
    backgroundImage: {
        position: 'absolute',
        width: width,
        height: height,
        top: 0,
        left: 0,
        opacity: 0.4,
        paddingTop: 50,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    icon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        height: 40,
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
    },
    linkText: {
        color: '#0000ff',
        marginLeft: 5,
        fontSize: 15,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
});

export default LogInScreen;