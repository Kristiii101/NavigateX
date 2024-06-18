import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyDiVBQoaBLvv9TYzBn9VRsFELFe9Xxga_c",
  authDomain: "navigatex-da924.firebaseapp.com",
  databaseURL: "https://navigatex-da924-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "navigatex-da924",
  storageBucket: "navigatex-da924.appspot.com",
  messagingSenderId: "655781136237",
  appId: "1:655781136237:web:3d65530cc33c3ddf663c64"
};

export const Firebase_App = initializeApp(firebaseConfig);
export const Firebase_Auth = getAuth(Firebase_App);

export const db = getDatabase(Firebase_App);