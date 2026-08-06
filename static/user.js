import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


const firebaseConfig = {
    apiKey: "AIzaSyBrxgm0VQTfRv0ixXh9uQ81HBJ8SmD8c1E",
    authDomain: "mecd-voice-ap.firebaseapp.com",
    projectId: "mecd-voice-ap",
    storageBucket: "mecd-voice-ap.firebasestorage.app",
    messagingSenderId: "595103941809",
    appId: "1:595103941809:web:e50577f156bcea3633ce90"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);



onAuthStateChanged(auth, (user)=>{

    if(user){

        document.getElementById("userName").textContent =
        user.displayName;


        document.getElementById("userPhoto").src =
        user.photoURL;


        document.getElementById("userId").textContent =
        "ID : " + user.uid;

    }

});
