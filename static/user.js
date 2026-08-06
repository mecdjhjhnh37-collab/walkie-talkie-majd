alert("user.js شغال");
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getDatabase,
    ref,
    get,
    set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import { app } from "./app.js";

const auth = getAuth(app);
const db = getDatabase(app);

async function createUserID(user){

    const userRef = ref(db, "users/" + user.uid);

    const snapshot = await get(userRef);

    if(!snapshot.exists()){

        const allUsers = await get(ref(db, "users"));

        let number = 1;

        if(allUsers.exists()){
            number = Object.keys(allUsers.val()).length + 1;
        }

        const customID = "MC-" + String(number).padStart(6,"0");

        await set(userRef,{
            id: customID,
            name: user.displayName,
            photo: user.photoURL
        });

    }

}

onAuthStateChanged(auth, async (user)=>{

    if(!user) return;

    await createUserID(user);

    const snap = await get(ref(db,"users/"+user.uid));

    if(snap.exists()){

        const info = snap.val();

        document.getElementById("userName").textContent = info.name;
        document.getElementById("userPhoto").src = info.photo;
        document.getElementById("userId").textContent = "ID : " + info.id;

    }

});
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getDatabase,
    ref,
    get,
    set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import { app } from "./app.js";

const auth = getAuth(app);
const db = getDatabase(app);

async function createUserID(user){

    const userRef = ref(db, "users/" + user.uid);

    const snapshot = await get(userRef);

    if(!snapshot.exists()){

        const allUsers = await get(ref(db, "users"));

        let number = 1;

        if(allUsers.exists()){
            number = Object.keys(allUsers.val()).length + 1;
        }

        const customID = "MC-" + String(number).padStart(6,"0");

        await set(userRef,{
            id: customID,
            name: user.displayName,
            photo: user.photoURL
        });

    }

}

onAuthStateChanged(auth, async (user)=>{

    if(!user) return;

    await createUserID(user);

    const snap = await get(ref(db,"users/"+user.uid));

    if(snap.exists()){

        const info = snap.val();

        document.getElementById("userName").textContent = info.name;
        document.getElementById("userPhoto").src = info.photo;
        document.getElementById("userId").textContent = "ID : " + info.id;

    }

});
