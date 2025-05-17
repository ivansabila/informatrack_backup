import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBHhX6urIhVyCZ8ACZ2I2a_bGZ7rbEbzTE",
    authDomain: "informatrack-ta.firebaseapp.com",
    databaseURL: "https://informatrack-ta-default-rtdb.firebaseio.com",
    projectId: "informatrack-ta",
    storageBucket: "informatrack-ta.firebasestorage.app",
    messagingSenderId: "418485726112",
    appId: "1:418485726112:web:dcce1c6e53a5d26d8f12c5",
    measurementId: "G-8XHJ8CZG8X",
};

const appClient = initializeApp(firebaseConfig);
const authClient = getAuth(appClient);

export { appClient, authClient };
