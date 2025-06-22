import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAS_EYSB0OwNZ1PiOsFpTimKIAGE-7heaE",
  authDomain: "photobooth-f7043.firebaseapp.com",
  projectId: "photobooth-f7043",
  storageBucket: "photobooth-f7043.appspot.com",
  messagingSenderId: "40430781780",
  appId: "1:40430781780:web:d679fc6cf68257ae55f4c1",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
