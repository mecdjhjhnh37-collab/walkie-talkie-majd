import { app } from "./app.js";

import {
    getDatabase,
    ref,
    push,
    set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const db = getDatabase(app);
const auth = getAuth(app);

export async function createRoom(roomName, password) {

    const user = auth.currentUser;

    if (!user) {
        alert("يجب تسجيل الدخول");
        return;
    }

    const roomRef = push(ref(db, "rooms"));

    await set(roomRef, {

        name: roomName,
        password: password || "",
        owner: user.uid,

        createdAt: Date.now(),

        members: {
            [user.uid]: true
        }

    });

    return roomRef.key;

}
document.addEventListener("DOMContentLoaded", () => {

    const createRoomBtn =
    document.getElementById("createRoomBtn");

    if (!createRoomBtn) return;

    createRoomBtn.onclick = async () => {

        const roomName = prompt("اسم الغرفة");

        if (!roomName) return;

        const password =
        prompt("كلمة المرور (اختياري)") || "";

        const roomID =
        await createRoom(roomName, password);

        alert("تم إنشاء الغرفة");

        window.location.href =
        "/room?id=" + roomID;

    };

});
