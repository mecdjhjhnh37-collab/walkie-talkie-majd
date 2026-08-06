import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getDatabase,
    ref,
    get,
    set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


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

const db = getDatabase(app);

const provider = new GoogleAuthProvider();



async function createUserID(user){

    const userRef = ref(db, "users/" + user.uid);

    const snapshot = await get(userRef);


    if(!snapshot.exists()){

        const allUsers = await get(ref(db, "users"));

        let number = 1;


        if(allUsers.exists()){

            number = Object.keys(allUsers.val()).length + 1;

        }


        const customID =
        "MC-" + String(number).padStart(6, "0");


        await set(userRef, {

            id: customID,
            name: user.displayName,
            photo: user.photoURL

        });

    }

}



document.addEventListener("DOMContentLoaded", ()=>{


    const loginBtn = document.getElementById("loginBtn");


    if(loginBtn){


        loginBtn.onclick = async ()=>{


            try{


                await signInWithPopup(auth, provider);

                window.location.href="/home";


            }catch(error){


                alert(error.message);


            }


        };


    }



    onAuthStateChanged(auth, async (user)=>{


        if(user){


            await createUserID(user);



            const name = document.getElementById("userName");
            const photo = document.getElementById("userPhoto");
            const id = document.getElementById("userId");


            const userData = await get(
                ref(db, "users/" + user.uid)
            );


            if(userData.exists()){


                const data = userData.val();


                if(name){

                    name.textContent = data.name;

                }


                if(photo){

                    photo.src = data.photo;

                }


                if(id){

                    id.textContent = "ID : " + data.id;

                }


            }


        }


    });


});
