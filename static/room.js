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

        cancelBtn.onclick = () => {

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
let roomId = "room-" + 
String(Date.now()).slice(-6);


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
