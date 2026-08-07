import { db } from "./app.js";

import {
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // معلومات الغرفة
    // =========================

    const roomTitle = document.getElementById("roomName");
    const roomIdText = document.getElementById("roomId");

    const roomName =
        localStorage.getItem("roomName");

    const roomId =
        localStorage.getItem("roomId");


    // اسم الغرفة
    if (roomTitle && roomName) {

        roomTitle.textContent = "🎙️ " + roomName;

    }


    // ID الغرفة
    if (roomIdText && roomId) {

        let displayRoomId = roomId;

        // إذا كان الـ ID القديم يبدأ بـ room-
        // نظهره للمستخدم بصيغة MC-
        if (roomId.startsWith("room-")) {

            const number =
                roomId.replace("room-", "");

            displayRoomId = "MC-" + number;

        }

        roomIdText.textContent =
            "ID: " + displayRoomId;

    }


    // =========================
    // اللغة
    // =========================

    const language =
        localStorage.getItem("language") || "ar";


    const input =
        document.getElementById("messageInput");


    if (input) {

        if (language === "tr") {

            input.placeholder =
                "Mesaj yaz...";

        } else {

            input.placeholder =
                "اكتب رسالة...";

        }

    }


    // =========================
    // الرسائل
    // =========================

    const messagesBox =
        document.getElementById("messages");

    const sendBtn =
        document.getElementById("sendMessage");


    let messagesRef = null;


    if (roomId && messagesBox) {

        messagesRef = collection(
            db,
            "rooms",
            roomId,
            "messages"
        );


        const q = query(
            messagesRef,
            orderBy("time")
        );


        onSnapshot(q, (snapshot) => {

            messagesBox.innerHTML = "";


            snapshot.forEach((messageDoc) => {

                const data =
                    messageDoc.data();


                const messageDiv =
                    document.createElement("div");

                messageDiv.className =
                    "message";


                messageDiv.innerHTML = `

                    <div class="message-head">

                        <img
                            src="${data.photo || "https://i.imgur.com/6VBx3io.png"}"
                            class="message-photo"
                        >

                        <span class="message-user">
                            ${data.user || "مستخدم"}
                        </span>

                    </div>

                    <div class="message-text">
                        ${data.text || ""}
                    </div>

                `;


                messagesBox.appendChild(
                    messageDiv
                );

            });


            // النزول لآخر رسالة
            messagesBox.scrollTop =
                messagesBox.scrollHeight;

        });

    }


    // =========================
    // إرسال رسالة
    // =========================

    if (sendBtn && input) {

        sendBtn.onclick = async () => {

            const text =
                input.value.trim();


            if (text === "" || !messagesRef) {

                return;

            }


            const userName =
                localStorage.getItem("userName") ||
                "مستخدم";


            const userPhoto =
                localStorage.getItem("userPhoto") ||
                "default.png";


            try {

                await addDoc(
                    messagesRef,
                    {

                        text: text,

                        user: userName,

                        photo: userPhoto,

                        time: serverTimestamp()

                    }
                );


                input.value = "";


            } catch (error) {

                console.error(error);

                alert(
                    "حدث خطأ أثناء إرسال الرسالة"
                );

            }

        };


        // إرسال بالضغط على Enter
        input.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter") {

                    sendBtn.click();

                }

            }
        );

    }


    // =========================
    // زر الاتصال
    // =========================

    const callBtn =
        document.getElementById("callBtn");


    if (callBtn) {

        callBtn.onclick = () => {

            alert(
                "📞 الاتصال قيد التطوير"
            );

        };

    }


    // =========================
    // زر الفيديو
    // =========================

    const videoBtn =
        document.getElementById("videoBtn");


    if (videoBtn) {

        videoBtn.onclick = () => {

            alert(
                "📹 الفيديو قيد التطوير"
            );

        };

    }


    // =========================
    // زر الميكروفون
    // =========================

    const voiceBtn =
        document.getElementById("voiceBtn");


    if (voiceBtn) {

        voiceBtn.onclick = () => {

            alert(
                "🎤 الصوت قيد التطوير"
            );

        };

    }

});
