import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Button } from 'react-native'
import React, {useState} from 'react'
//import { useNavigation, useRoute } from '@react-navigation/native';
import { Firebase_Auth } from '../utils/FireBaseConfig';
import { TextInput } from 'react-native-gesture-handler';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword} from 'firebase/auth'


const LogInScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = Firebase_Auth;

    const signIn = async () =>{
        setLoading(true);
        try{
            const response = await signInWithEmailAndPassword(auth, email, password);
            //console.log(response);
        } catch(error){
            console.log(error);
            alert('Sign in failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    const signUp = async () =>{
        setLoading(true);
        try{
            const response = await createUserWithEmailAndPassword(auth, email, password);
            //console.log(response);
            alert('Check your email!');
        } catch(error){
            console.log(error);
            alert('Registration failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

  return (
    <View style={styles.container}>
        <TextInput style={styles.textInput}
            value={email}
            placeholder='Email'
            autoCapitalize='none'
            onChangeText={(text) => setEmail(text)}
        ></TextInput>
        <TextInput style={styles.textInput}
            secureTextEntry={true}
            value={password}
            placeholder='Password'
            autoCapitalize='none'
            onChangeText={(text) => setPassword(text)}
        ></TextInput>

        {loading ? <ActivityIndicator size="large" color="0000ff" />
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
    backButton:{
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

export default LogInScreen