// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBZ-q-2BPN9-m_4S6KNT142uy-7hQ4b11Y",
    authDomain: "social-app-cf00a.firebaseapp.com",
    projectId: "social-app-cf00a",
    storageBucket: "social-app-cf00a.firebasestorage.app",
    messagingSenderId: "636694123334",
    appId: "1:636694123334:web:41a8f9a2e11310dea5cb47",
    measurementId: "G-VB5WJ284SJ"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);