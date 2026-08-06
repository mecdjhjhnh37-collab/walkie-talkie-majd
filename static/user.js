import { getAuth, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { app } from "./app.js";

const auth = getAuth(app);


onAuthStateChanged(auth, (user)=>{


    if(user){


        document.getElementById("userName").textContent =
        user.displayName;


        document.getElementById("userPhoto").src =
        user.photoURL;


        document.getElementById("userId").textContent =
        "ID : " + user.uid;


    } else {

        console.log("لا يوجد مستخدم");

    }


});
