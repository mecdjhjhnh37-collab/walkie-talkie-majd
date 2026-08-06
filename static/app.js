import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyBrxgm0VQTfRv0ixXh9uQ81HBJ8SmD8c1E",
    authDomain: "mecd-voice-ap.firebaseapp.com",
    projectId: "mecd-voice-ap",
    storageBucket: "mecd-voice-ap.firebasestorage.app",
    messagingSenderId: "595103941809",
    appId: "1:595103941809:web:e50577f156bcea3633ce90"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();



// Google Login
document.addEventListener("DOMContentLoaded", () => {


    const loginBtn = document.getElementById("loginBtn");


    if (loginBtn) {


        loginBtn.addEventListener("click", async () => {


            alert("وصل للزر");


            try {


                const result = await signInWithPopup(
                    auth,
                    provider
                );


                alert("تم الدخول");


                console.log(result.user);


                window.location.href = "/home";


            } catch(error) {


                console.log(error);


                alert(
                    error.code +
                    "\n\n" +
                    error.message
                );


            }


        });


    }


});
