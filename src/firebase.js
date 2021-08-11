import firebase from "firebase/app";
import "firebase/auth" //authentication module
import "firebase/firestore" //firestore module
import "firebase/functions" //functions module
import "firebase/storage" //storage module

const app = firebase.initializeApp({
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
})

//create authentication and database instances and make accessible to rest of application
export const auth = app.auth();
export const db = app.firestore();
export const functions = app.functions();
export const storage = app.storage();