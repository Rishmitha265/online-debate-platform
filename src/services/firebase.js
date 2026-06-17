// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDI5FCYCq9NeXRw_PSKO4cFMS7qWecoHiY",
  authDomain: "online-debate-e94b1.firebaseapp.com",
  projectId: "online-debate-e94b1",
  storageBucket: "online-debate-e94b1.firebasestorage.app",
  messagingSenderId: "575581705612",
  appId: "1:575581705612:web:d8a344c5362653a68532a9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth= getAuth(app);
 export const db=getFirestore(app);

export default app;