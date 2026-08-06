import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// Firebase
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

const provider = new GoogleAuthProvider();




function loadLanguage(){

    let lang = localStorage.getItem("language") || "ar";

    const friends = document.getElementById("friendsText");
    const create = document.getElementById("createRoomText");
    const join = document.getElementById("joinRoomText");
    const publicRooms = document.getElementById("publicRoomsText");
    const settings = document.getElementById("settingsText");


    if(friends)
        friends.textContent = translations[lang].friends.replace("👥 ","");

    if(create)
        create.textContent = translations[lang].createRoom.replace("🎙️ ","");

    if(join)
        join.textContent = translations[lang].joinRoom.replace("🚪 ","");

    if(publicRooms)
        publicRooms.textContent = translations[lang].publicRooms.replace("🌍 ","");

    if(settings)
        settings.textContent = translations[lang].settings.replace("⚙️ ","");

}


document.addEventListener("DOMContentLoaded", loadLanguage);

    const loginBtn = document.getElementById("loginBtn");


    if(loginBtn){

        loginBtn.onclick = async () => {


            try {

                const result = await signInWithPopup(
                    auth,
                    provider
                );


                const user = result.user;


                console.log("Login:", user);


                window.location.href = "/home";


            } catch(error) {


                console.error(error);

                alert(error.message);


            }


        };

    }


});
