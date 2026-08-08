import { db } from "./app.js";

import {
    startVoiceRecording,
    stopVoiceRecording
} from "./voiceRecorder.js";

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
    // عناصر الغرفة
    // =====================================

    const roomTitle =
        document.getElementById("roomName");

    const roomIdText =
        document.getElementById("roomId");

    const messagesBox =
        document.getElementById("messages");

    const input =
        document.getElementById("messageInput");

    const sendBtn =
        document.getElementById("sendMessage");

    const voiceBtn =
        document.getElementById("voiceBtn");

    const callBtn =
        document.getElementById("callBtn");

    const videoBtn =
        document.getElementById("videoBtn");


    // =====================================
    // اللغة
    // =====================================

    const language =
        localStorage.getItem("language") || "ar";

    const isTurkish =
        language === "tr" ||
        language === "turkish";


    // =====================================
    // الحصول على ID الغرفة
    // =====================================

    const urlParams =
        new URLSearchParams(window.location.search);

    let roomId =
        urlParams.get("roomId") ||
        localStorage.getItem("roomId");


    if (!roomId) {

        if (roomTitle) {
            roomTitle.textContent =
                isTurkish
                    ? "Oda bulunamadı"
                    : "لم يتم العثور على الغرفة";
        }

        if (roomIdText) {
            roomIdText.textContent =
                "ID: ------";
        }

        return;
    }


    roomId = roomId.trim();


    // =====================================
    // إصلاح ID القديم
    // =====================================

    if (
        roomId
            .toLowerCase()
            .startsWith("room-")
    ) {

        roomId =
            "MC-" + roomId.substring(5);

    }


    try {

        // =====================================
        // جلب الغرفة
        // =====================================

        const roomRef =
            doc(
                db,
                "rooms",
                roomId
            );


        const roomDoc =
            await getDoc(roomRef);


        if (!roomDoc.exists()) {

            if (roomTitle) {
                roomTitle.textContent =
                    isTurkish
                        ? "Oda bulunamadı"
                        : "الغرفة غير موجودة";
            }

            if (roomIdText) {
                roomIdText.textContent =
                    "ID: " + roomId;
            }

            return;
        }


        // =====================================
        // بيانات الغرفة
        // =====================================

        const room =
            roomDoc.data();


        // الأهم:
        // نستخدم Document ID الحقيقي
        // وليس room.id إذا كان مختلفاً

        const realRoomId =
            roomDoc.id;


        const realRoomName =
            room.name ||
            room.roomName ||
            "Mecd Voice";


        console.log(
            "✅ Room ID:",
            realRoomId
        );

        console.log(
            "✅ Room name:",
            realRoomName
        );


        // =====================================
        // حفظ البيانات
        // =====================================

        localStorage.setItem(
            "roomId",
            realRoomId
        );

        localStorage.setItem(
            "roomName",
            realRoomName
        );


        // =====================================
        // عرض الاسم
        // =====================================

        if (roomTitle) {

            roomTitle.textContent =
                "🎙️ " + realRoomName;

        }


        // =====================================
        // عرض ID
        // =====================================

        if (roomIdText) {

            roomIdText.textContent =
                "ID: " + realRoomId;

        }


        // =====================================
        // مرجع الرسائل
        // =====================================

        const messagesRef =
            collection(
                db,
                "rooms",
                realRoomId,
                "messages"
            );


      // =====================================
// قراءة الرسائل
// =====================================

const messagesQuery =
    query(
        messagesRef,
        orderBy("time")
    );


onSnapshot(
    messagesQuery,
    (snapshot) => {

        if (!messagesBox) {
            return;
        }

        messagesBox.innerHTML = "";


        snapshot.forEach(
            (messageDoc) => {

                const data =
                    messageDoc.data();


                const messageDiv =
                    document.createElement("div");


                messageDiv.className =
                    "message";


                // =================================
                // 👤 رأس الرسالة
                // =================================

                const messageHead =
                    document.createElement("div");

                messageHead.className =
                    "message-head";


                const photo =
                    document.createElement("img");

                photo.src =
                    data.photo || "default.png";

                photo.className =
                    "message-photo";


                const user =
                    document.createElement("span");

                user.className =
                    "message-user";

                user.textContent =
                    data.user || "مستخدم";


                messageHead.appendChild(photo);
                messageHead.appendChild(user);

                messageDiv.appendChild(messageHead);


                // =================================
                // 🎤 رسالة صوتية
                // =================================

                if (
                    data.type === "audio" &&
                    data.audioUrl
                ) {

                    const audio =
                        document.createElement("audio");


                    audio.controls =
                        true;

                    audio.preload =
                        "metadata";

                    audio.src =
                        data.audioUrl;


                    audio.style.width =
                        "100%";

                    audio.style.marginTop =
                        "10px";


                    messageDiv.appendChild(
                        audio
                    );

                }


                // =================================
                // 💬 رسالة نصية
                // =================================

                else {

                    const messageText =
                        document.createElement("div");


                    messageText.className =
                        "message-text";


                    messageText.textContent =
                        data.text || "";


                    messageDiv.appendChild(
                        messageText
                    );

                }


                // =================================
                // إضافة الرسالة للدردشة
                // =================================

                messagesBox.appendChild(
                    messageDiv
                );

            }
        );


        messagesBox.scrollTop =
            messagesBox.scrollHeight;

    },

    (error) => {

        console.error(
            "❌ Messages error:",
            error
        );

    }
);


        // =====================================
        // إرسال الرسائل
        // =====================================

        if (
            sendBtn &&
            input
        ) {

            sendBtn.addEventListener(
                "click",
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

                        sendBtn.disabled =
                            true;


                        await addDoc(
                            messagesRef,
                            {

                                type: "text",

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
                            "❌ Send message error:",
                            error
                        );


                        alert(
                            isTurkish
                                ? "Mesaj gönderilemedi."
                                : "❌ لم يتم إرسال الرسالة."
                        );

                    } finally {

                        sendBtn.disabled =
                            false;

                    }

                }
            );


            input.addEventListener(
                "keydown",
                (event) => {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        sendBtn.click();

                    }

                }
            );

        }


        // =====================================
        // 🎤 تسجيل الصوت
        // =====================================

        if (voiceBtn) {

            voiceBtn.addEventListener(
                "click",
                async () => {

                    try {

                        // =============================
                        // بدء التسجيل
                        // =============================

                        if (
                            voiceBtn.dataset.recording !== "true"
                        ) {

                            voiceBtn.dataset.recording =
                                "true";

                            voiceBtn.textContent =
                                "⏹️";


                            await startVoiceRecording(
                                realRoomId,
                                messagesRef
                            );

                        }

                        // =============================
                        // إيقاف التسجيل
                        // =============================

                        else {

                            voiceBtn.dataset.recording =
                                "false";

                            voiceBtn.textContent =
                                "🎤";


                            await stopVoiceRecording();

                        }

                    } catch (error) {

                        console.error(
                            "❌ Voice error:",
                            error
                        );


                        voiceBtn.dataset.recording =
                            "false";

                        voiceBtn.textContent =
                            "🎤";


                        alert(
                            isTurkish
                                ? "Ses kaydı başlatılamadı."
                                : "❌ لم يتم تسجيل الصوت."
                        );

                    }

                }
            );

        }


        // =====================================
        // 📞 الاتصال
        // =====================================

        if (callBtn) {

            callBtn.addEventListener(
                "click",
                () => {

                    alert(
                        isTurkish
                            ? "📞 Arama yakında."
                            : "📞 الاتصال قيد التطوير"
                    );

                }
            );

        }


        // =====================================
        // 📹 الفيديو
        // =====================================

        if (videoBtn) {

            videoBtn.addEventListener(
                "click",
                () => {

                    alert(
                        isTurkish
                            ? "📹 Görüntülü arama yakında."
                            : "📹 الفيديو قيد التطوير"
                    );

                }
            );

        }


    } catch (error) {

        console.error(
            "❌ Room loading error:",
            error
        );


        if (roomTitle) {

            roomTitle.textContent =
                isTurkish
                    ? "Oda yüklenemedi"
                    : "تعذر تحميل الغرفة";

        }

    }

});
