import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


import {
    getDatabase,
    ref,
    get,
    set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


import { app } from "./app.js";


const auth = getAuth(app);
const database = getDatabase(app);



async function createUserID(user){


    const userRef = ref(database, "users/" + user.uid);


    const snapshot = await get(userRef);



    if(!snapshot.exists()){


        const usersSnap = await get(ref(database,"users"));


        let number = 1;


        if(usersSnap.exists()){

            number = Object.keys(usersSnap.val()).length + 1;

        }



        const customID = 
        "MC-" + String(number).padStart(6,"0");



        await set(userRef,{

            id: customID,

            name: user.displayName || "مستخدم",

            photo: user.photoURL || "default.png"

        });


    }


}





onAuthStateChanged(auth, async(user)=>{


    if(!user) return;



    await createUserID(user);



    const snapshot = await get(
        ref(database,"users/" + user.uid)
    );



    if(!snapshot.exists()) return;



    const info = snapshot.val();



    // حفظ بيانات المستخدم للغرفة والرسائل

    localStorage.setItem(
        "userName",
        info.name
    );


    localStorage.setItem(
        "userPhoto",
        info.photo
    );
    localStorage.setItem(
    "name",
    info.name
);


localStorage.setItem(
    "photo",
    info.photo
);


    localStorage.setItem(
        "userID",
        info.id
    );



    // عرض البيانات في الصفحة


    const name =
    document.getElementById("userName");


    const photo =
    document.getElementById("userPhoto");


    const id =
    document.getElementById("userId");



    if(name){

        name.textContent = info.name;

    }



    if(photo){

        photo.src = info.photo;

    }



    if(id){

        id.textContent =
        "ID : " + info.id;

    }



});
