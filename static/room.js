import { db } from "./app.js";

import {
  doc,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
document.addEventListener("DOMContentLoaded", () => {
    const savedRoomName = localStorage.getItem("roomName");
const savedRoomId = localStorage.getItem("roomId");


const title = document.getElementById("roomName");
const id = document.getElementById("roomId");
 

if(title && savedRoomName){

    title.textContent = "🎙️ " + savedRoomName;

}


if(id && savedRoomId){

    id.textContent = "ID: " + savedRoomId;

}

    const popup = document.getElementById("roomPopup");

    // زر إنشاء غرفة من الصفحة الرئيسية
    const openBtn = document.getElementById("createRoomBtn");

    // زر إلغاء داخل النافذة
    const cancelBtn = document.getElementById("cancelRoom");

    // زر إنشاء داخل النافذة
    const createBtn = document.getElementById("createRoomNow");

    // فتح النافذة
    if(openBtn){

        openBtn.onclick = () => {

            popup.style.display = "flex";

        };

    }

    // إغلاق النافذة
    if(cancelBtn){

        createBtn.onclick = async () => {

            popup.style.display = "none";

        };

    }

    // إنشاء الغرفة والانتقال
    if(createBtn){

        createBtn.onclick = () => {

            const roomName =
            document.getElementById("roomName").value.trim();

            if(roomName === ""){

                alert("اكتب اسم الغرفة");

                return;

            }

            // إنشاء ID للغرفة
const counterRef = doc(db, "counters", "rooms");

const roomId = await runTransaction(db, async (transaction) => {

    const counterDoc = await transaction.get(counterRef);

    let lastNumber = counterDoc.data().lastNumber;

    lastNumber++;

    transaction.update(counterRef, {
        lastNumber: lastNumber
    });

    return "room-" + String(lastNumber).padStart(6, "0");

});


// حفظ بيانات الغرفة
localStorage.setItem(
    "roomName",
    roomName
);


localStorage.setItem(
    "roomId",
    roomId
);


// الانتقال للغرفة
window.location.href = "/room";

        };

    }

});
