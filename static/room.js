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
    // ID الغرفة
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


        const realRoomId =
            roomDoc.id;


        const realRoomName =
            room.name ||
            room.roomName ||
            "Mecd Voice";


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
        // رسائل مؤقتة محلية
        // مهم حتى لا يختفي التسجيل
        // عند إرسال رسالة جديدة
        // =====================================

        const localAudioMessages = [];


        // =====================================
        // دالة عرض رسالة
        // =====================================

        function createMessageElement(data) {

            const messageDiv =
                document.createElement("div");

            messageDiv.className =
                "message";


            const photo =
                data.photo ||
                "default.png";


            const user =
                data.user ||
                "مستخدم";


            // =================================
            // 🎤 صوت
            // =================================

            if (
                data.type === "audio" &&
                data.audioUrl
            ) {

                messageDiv.innerHTML = `

                    <div class="message-head">

                        <img
                            src="${photo}"
                            class="message-photo"
                        >

                        <span class="message-user">
                            ${user}
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
            // 📝 نص
            // =================================

            else {

                messageDiv.innerHTML = `

                    <div class="message-head">

                        <img
                            src="${photo}"
                            class="message-photo"
                        >

                        <span class="message-user">
                            ${user}
                        </span>

                    </div>

                    <div class="message-text">
                        ${data.text || ""}
                    </div>

                `;

            }


            return messageDiv;
        }


        // =====================================
        // عرض كل الرسائل
        // =====================================

        function renderMessages(snapshot) {

            if (!messagesBox) {
                return;
            }


            messagesBox.innerHTML = "";


            // الرسائل الموجودة في Firestore
            snapshot.forEach(
                (messageDoc) => {

                    const data =
                        messageDoc.data();


                    messagesBox.appendChild(
                        createMessageElement(data)
                    );

                }
            );


            // =================================
            // إعادة عرض التسجيلات المحلية
            // التي لم تظهر بعد في Snapshot
            // =================================

            localAudioMessages.forEach(
                (audioMessage) => {

                    const exists =
                        Array.from(
                            snapshot.docs
                        ).some(
                            docItem => {

                                const data =
                                    docItem.data();

                                return (
                                    data.type === "audio" &&
                                    data.audioUrl ===
                                    audioMessage.audioUrl
                                );

                            }
                        );


                    if (!exists) {

                        messagesBox.appendChild(
                            createMessageElement(
                                audioMessage
                            )
                        );

                    }

                }
            );


            messagesBox.scrollTop =
                messagesBox.scrollHeight;

        }


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

                console.log(
                    "📨 تم تحديث الرسائل:",
                    snapshot.size
                );


                renderMessages(snapshot);

            },

            (error) => {

                console.error(
                    "❌ Messages error:",
                    error
                );

            }
        );


        // =====================================
        // إرسال الرسائل النصية
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

                        // =================================
                        // بدء التسجيل
                        // =================================

                        if (
                            voiceBtn.dataset.recording !==
                            "true"
                        ) {

                            voiceBtn.dataset.recording =
                                "true";


                            voiceBtn.textContent =
                                "⏹️";


                            console.log(
                                "🔴 بدء التسجيل"
                            );


                            await startVoiceRecording(
                                realRoomId,
                                messagesRef
                            );

                        }

                        // =================================
                        // إيقاف التسجيل
                        // =================================

                        else {

                            console.log(
                                "⏹️ إيقاف التسجيل"
                            );


                            voiceBtn.dataset.recording =
                                "false";


                            voiceBtn.textContent =
                                "🎤";


                            await stopVoiceRecording();


                            console.log(
                                "✅ انتهى إرسال التسجيل"
                            );

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
                                : "❌ لم يتم إرسال التسجيل الصوتي."
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
