document.addEventListener("DOMContentLoaded", () => {

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

            // انتقال مؤقت
            window.location.href = "/room";

        };

    }

});
