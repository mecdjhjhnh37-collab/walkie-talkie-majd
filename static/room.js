import { db } from "./app.js";

import {
    doc,
    getDoc,
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", async () => {

    // =====================================
    // عناصر صفحة الغرفة
    // =====================================

    const roomTitle =
        document.getElementById("roomName");

    const roomIdText =
        document.getElementById("roomId");


    // =====================================
    // اللغة
    // =====================================

    const language =
        localStorage.getItem("language") || "ar";


    // =====================================
    // الحصول على ID الغرفة
    // =====================================

    const urlParams =
        new URLSearchParams(window.location.search);

    let roomId =
        urlParams.get("roomId");


    // إذا لم يوجد في الرابط، نأخذه من التخزين
    if (!roomId) {

        roomId =
            localStorage.getItem("roomId");

    }


    // =====================================
    // إذا ما في ID
    // =====================================

    if (!roomId) {

        if (roomTitle) {

            roomTitle.textContent =
                language === "tr"
                    ? "Oda bulunamadı"
                    : "لم يتم العثور على الغرفة";

        }

        if (roomIdText) {

            roomIdText.textContent =
                "ID: ------";

        }

        return;

    }


    // =====================================
    // تنظيف ID
    // =====================================

    roomId =
        roomId.trim();


    // =====================================
    // جلب الغرفة من Firebase
    // =====================================

    try {

        const roomRef =
            doc(db, "rooms", roomId);

        const roomDoc =
            await getDoc(roomRef);


        // =================================
        // الغرفة غير موجودة
        // =================================

        if (!roomDoc.exists()) {

            console.error(
                "Room not found:",
                roomId
            );


            if (roomTitle) {

                roomTitle.textContent =
                    language === "tr"
                        ? "Oda bulunamadı"
                        : "الغرفة غير موجودة";

            }


            if (roomIdText) {

                roomIdText.textContent =
                    "ID: " + roomId;

            }

            return;

        }


        // =================================
        // بيانات الغرفة
        // =================================

        const room =
            roomDoc.data();


        const realRoomName =
            room.name || "Mecd Voice";


        const realRoomId =
            room.id || roomId;


        // =================================
        // حفظ البيانات محلياً
        // =================================

        localStorage.setItem(
            "roomName",
            realRoomName
        );


        localStorage.setItem(
            "roomId",
            realRoomId
        );


        // =================================
        // عرض اسم الغرفة
        // =================================

        if (roomTitle) {

            roomTitle.textContent =
                "🎙️ " + realRoomName;

        }


        // =================================
        // عرض ID الحقيقي
        // =================================

        if (roomIdText) {

            roomIdText.textContent =
                "ID: " + realRoomId;

        }


        // =====================================
        // الرسائل
        // =====================================

        const messagesBox =
            document.getElementById("messages");


        const input =
            document.getElementById("messageInput");


        const sendBtn =
            document.getElementById("sendMessage");


        let messagesRef = null;


        if (messagesBox) {

            messagesRef =
                collection(
                    db,
                    "rooms",
                    realRoomId,
                    "messages"
                );


            const messagesQuery =
                query(
                    messagesRef,
                    orderBy("time")
                );


            onSnapshot(
                messagesQuery,
                (snapshot) => {

                    messagesBox.innerHTML = "";


                    snapshot.forEach(
                        (messageDoc) => {

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

                        }
                    );


                    messagesBox.scrollTop =
                        messagesBox.scrollHeight;

                }
            );

        }


        // =====================================
        // إرسال الرسالة
        // =====================================

        if (sendBtn && input && messagesRef) {

            sendBtn.onclick =
                async () => {

                    const text =
                        input.value.trim();


                    if (!text) {

                        return;

                    }


                    const userName =
                        localStorage.getItem(
                            "userName"
                        ) ||
                        "مستخدم";


                    const userPhoto =
                        localStorage.getItem(
                            "userPhoto"
                        ) ||
                        "default.png";


                    try {

                        await addDoc(
                            messagesRef,
                            {

                                text: text,

                                user: userName,

                                photo: userPhoto,

                                time:
                                    serverTimestamp()

                            }
                        );


                        input.value = "";


                    } catch (error) {

                        console.error(
                            "Send message error:",
                            error
                        );

                    }

                };


            input.addEventListener(
                "keydown",
                (event) => {

                    if (
                        event.key === "Enter"
                    ) {

                        sendBtn.click();

                    }

                }
            );

        }


        // =====================================
        // زر الاتصال
        // =====================================

        const callBtn =
            document.getElementById("callBtn");


        if (callBtn) {

            callBtn.onclick = () => {

                alert(
                    language === "tr"
                        ? "📞 Arama yakında."
                        : "📞 الاتصال قيد التطوير"
                );

            };

        }


        // =====================================
        // زر الفيديو
        // =====================================

        const videoBtn =
            document.getElementById("videoBtn");


        if (videoBtn) {

            videoBtn.onclick = () => {

                alert(
                    language === "tr"
                        ? "📹 Görüntülü arama yakında."
                        : "📹 الفيديو قيد التطوير"
                );

            };

        }


    } catch (error) {

        console.error(
            "Room loading error:",
            error
        );


        if (roomTitle) {

            roomTitle.textContent =
                language === "tr"
                    ? "Oda yüklenemedi"
                    : "تعذر تحميل الغرفة";

        }

    }
// =====================================
// تشغيل / إيقاف الميكروفون
// =====================================

const voiceBtn =
    document.getElementById("voiceBtn");

let microphoneStream = null;
let microphoneOn = false;

if (voiceBtn) {

    voiceBtn.addEventListener("click", async () => {

        try {

            // تشغيل الميكروفون
            if (!microphoneOn) {

                microphoneStream =
                    await navigator.mediaDevices.getUserMedia({
                        audio: true
                    });

                microphoneOn = true;

                voiceBtn.textContent = "🔴";

                console.log("Microphone ON");

            }

            // إيقاف الميكروفون
            else {

                if (microphoneStream) {

                    microphoneStream
                        .getTracks()
                        .forEach(track => track.stop());

                }

                microphoneStream = null;

                microphoneOn = false;

                voiceBtn.textContent = "🎤";

                console.log("Microphone OFF");

            }

        } catch (error) {

            console.error(
                "Microphone error:",
                error
            );

            alert(
                language === "tr"
                    ? "Mikrofon izni verilmedi."
                    : "لم يتم السماح باستخدام الميكروفون."
            );

        }

    });

}
});
