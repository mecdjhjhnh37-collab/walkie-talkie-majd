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
    serverTimestamp
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
        new URLSearchParams(
            window.location.search
        );

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


    roomId =
        roomId.trim();


    // =====================================
    // إصلاح ID القديم
    // room-000001 → MC-000001
    // =====================================

    if (
        roomId
            .toLowerCase()
            .startsWith("room-")
    ) {

        roomId =
            "MC-" +
            roomId.substring(5);

    }


    try {

        // =====================================
        // جلب بيانات الغرفة
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


        // نستخدم Document ID الحقيقي
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
        // عرض اسم الغرفة
        // =====================================

        if (roomTitle) {

            roomTitle.textContent =
                "🎙️ " + realRoomName;

        }


        // =====================================
        // عرض ID الغرفة
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
        // قراءة الرسائل من Firebase
        // =====================================

        onSnapshot(
            messagesRef,

            (snapshot) => {

                if (!messagesBox) {
                    return;
                }


                const messages = [];


                snapshot.forEach(
                    (messageDoc) => {

                        messages.push({

                            id:
                                messageDoc.id,

                            data:
                                messageDoc.data()

                        });

                    }
                );


                // =====================================
                // ترتيب الرسائل
                // =====================================

                messages.sort(
                    (a, b) => {

                        const timeA =
                            a.data.time &&
                            typeof a.data.time.toMillis ===
                                "function"
                                ? a.data.time.toMillis()
                                : 0;


                        const timeB =
                            b.data.time &&
                            typeof b.data.time.toMillis ===
                                "function"
                                ? b.data.time.toMillis()
                                : 0;


                        return timeA - timeB;

                    }
                );


                // =====================================
                // تحديث الدردشة
                // =====================================

                messagesBox.innerHTML = "";


                messages.forEach(
                    (message) => {

                        const data =
                            message.data;


                        const messageDiv =
                            document.createElement(
                                "div"
                            );


                        messageDiv.className =
                            "message";


                        messageDiv.dataset.messageId =
                            message.id;


                        const userName =
                            data.user ||
                            "مستخدم";


                        const userPhoto =
                            data.photo ||
                            "default.png";


                        // =================================
                        // 🎤 رسالة صوتية
                        // =================================

                        if (
                            data.type === "audio" &&
                            data.audioUrl
                        ) {

                            messageDiv.innerHTML = `

                                <div class="message-head">

                                    <img
                                        src="${userPhoto}"
                                        class="message-photo"
                                    >

                                    <span
                                        class="message-user"
                                    >
                                        ${userName}
                                    </span>

                                </div>

                                <audio
                                    controls
                                    preload="metadata"
                                    src="${data.audioUrl}"
                                    style="
                                        width:100%;
                                        margin-top:10px;
                                    "
                                ></audio>

                            `;

                        }


                        // =================================
                        // 💬 رسالة نصية
                        // =================================

                        else if (
                            data.type === "text"
                        ) {

                            messageDiv.innerHTML = `

                                <div class="message-head">

                                    <img
                                        src="${userPhoto}"
                                        class="message-photo"
                                    >

                                    <span
                                        class="message-user"
                                    >
                                        ${userName}
                                    </span>

                                </div>

                                <div class="message-text">
                                    ${data.text || ""}
                                </div>

                            `;

                        }


                        messagesBox.appendChild(
                            messageDiv
                        );

                    }
                );


                messagesBox.scrollTop =
                    messagesBox.scrollHeight;


                console.log(
                    "✅ عدد الرسائل:",
                    messages.length
                );

            },


            (error) => {

                console.error(
                    "❌ Messages error:",
                    error
                );

            }
        );


        // =====================================
        // 💬 زر إرسال الرسائل
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

                                type:
                                    "text",

                                text:
                                    text,

                                user:
                                    userName,

                                photo:
                                    userPhoto,

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


            // Enter للإرسال

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
        // 🎤 ربط زر تسجيل الصوت فقط
        // =====================================
        //
        // كل كود التسجيل موجود في:
        // voiceRecorder.js
        //
        // room.js فقط يرسل:
        // ID الغرفة + messagesRef
        // =====================================

        if (voiceBtn) {

            voiceBtn.addEventListener(
                "click",
                async () => {

                    try {

                        // بدء التسجيل

                        if (
                            voiceBtn.dataset.recording !==
                            "true"
                        ) {

                            voiceBtn.dataset.recording =
                                "true";


                            voiceBtn.textContent =
                                "⏹️";


                            console.log(
                                "🔴 بدء تسجيل الصوت"
                            );


                            await startVoiceRecording(
                                realRoomId,
                                messagesRef
                            );

                        }

                        // إيقاف التسجيل

                        else {

                            voiceBtn.dataset.recording =
                                "false";


                            voiceBtn.textContent =
                                "🎤";


                            console.log(
                                "⏹️ إيقاف تسجيل الصوت"
                            );


                            stopVoiceRecording();

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
                                ? "Ses kaydı gönderilemedi."
                                : "❌ لم يتم تسجيل الصوت."
                        );

                    }

                }
            );

        }


        // =====================================
        // 📞 زر الاتصال
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
        // 📹 زر الفيديو
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
