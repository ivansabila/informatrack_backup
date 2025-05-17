import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const authDB = getAuth(app);

const form = document.querySelector("#formLogin");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    const error = {};

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
        error.email = "Masukkan email dengan format yang benar";
    }

    if (password.length < 6) {
        error.password = "Password minimal 6 karakter";
    }

    if (Object.keys(error).length) {
        document.querySelector("#errorEmail").textContent = error.email || "";
        document.querySelector("#errorPassword").textContent = error.password || "";
        return;
    }
    
    const userCredential = await signInWithEmailAndPassword(authDB, email, password);
    const idToken = await userCredential.user.getIdToken();
    
    const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
    });
    
    const result = await res.json();    

    if ( !res.ok ) {
        document.querySelector("#errorEmail").textContent = result.error || "Login gagal";
        return;
    }

    window.location.href = "/";
});
