import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getDatabase,
    ref,
    get,
    set,
    runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import { app } from "./app.js";

const auth = getAuth(app);
const database = getDatabase(app);


async function createUserID(user) {

    const userRef = ref(database, "users/" + user.uid);

    const snapshot = await get(userRef);

    // إذا المستخدم عنده ID مسبقاً، لا نعمل واحد جديد
    if (snapshot.exists()) {
        return snapshot.val();
    }


    // إنشاء رقم مستخدم جديد بشكل آمن
    const counterRef = ref(database, "counters/users");

    const result = await runTransaction(
        counterRef,
        (currentValue) => {

            if (currentValue === null) {
                return 1;
            }

            return currentValue + 1;
        }
    );


    if (!result.committed) {
        throw new Error("فشل إنشاء رقم المستخدم");
    }


    const number = result.snapshot.val();


    const customID =
        "MC-" + String(number).padStart(6, "0");


    const userData = {

        id: customID,

        uid: user.uid,

        name: user.displayName || "مستخدم",

        photo: user.photoURL || "default.png"

    };


    await set(userRef, userData);


    return userData;
}



onAuthStateChanged(auth, async (user) => {

    if (!user) {
        return;
    }


    try {

        const info = await createUserID(user);


        // حفظ UID أيضاً
        localStorage.setItem(
            "userUid",
            user.uid
        );


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


        // عرض الاسم
        const nameElement =
            document.getElementById("userName");


        if (nameElement) {
            nameElement.textContent = info.name;
        }


        // عرض الصورة
        const photoElement =
            document.getElementById("userPhoto");


        if (photoElement) {
            photoElement.src = info.photo;
        }


        // عرض ID
        const idElement =
            document.getElementById("userId");


        if (idElement) {
            idElement.textContent =
                "ID : " + info.id;
        }


    } catch (error) {

        console.error(
            "خطأ في إنشاء بيانات المستخدم:",
            error
        );

    }

});
