import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBk4GTXuioWGmKaVNXmRmL4KnlsCePfwf0",
  authDomain: "skintendent.firebaseapp.com",
  projectId: "skintendent",
  storageBucket: "skintendent.appspot.com",
  messagingSenderId: "337062534090",
  appId: "1:337062534090:web:f897017026a94149a90d33",
  measurementId: "G-8LF9YGQPKR"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);