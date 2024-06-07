// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, signInWithEmailAndPassword, browserSessionPersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiVBQoaBLvv9TYzBn9VRsFELFe9Xxga_c",
  authDomain: "navigatex-da924.firebaseapp.com",
  projectId: "navigatex-da924",
  storageBucket: "navigatex-da924.appspot.com",
  messagingSenderId: "655781136237",
  appId: "1:655781136237:web:3d65530cc33c3ddf663c64"
};

// Initialize Firebase
export const Firebase_App = initializeApp(firebaseConfig);
export const Firebase_Auth = getAuth(Firebase_App);


// export const Firebase_Persistance = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage)
// });

// export const Firebase_Auth = getAuth(Firebase_App);
// setPersistence(Firebase_Auth, browserSessionPersistence)
//   .then(() => {
//     return signInWithEmailAndPassword(auth, email, password);
//   })
//   .catch((error) => {
//     const errorCode = error.code;
//     const errorMessage = error.message;
//   });