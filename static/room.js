import { storage, db } from "./app.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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

    const roomTitle = document.getElementById("roomName");
    const roomIdText = document.getElementById("roomId");
    const messagesBox = document.getElementById("messages");
    const input = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendMessage");
    const voiceBtn = document.getElementById("voiceBtn");
    const callBtn = document.getElementById("callBtn");
    const videoBtn = document.getElementById("videoBtn");


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

    if (roomId.toLowerCase().startsWith("room-")) {

        roomId =
            "MC-" + roomId.substring(5);

    }


    // =====================================
    // جلب بيانات الغرفة
    // =====================================

    try {

        const roomRef =
            doc(db, "rooms", roomId);

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

        const realRoomName =
            room.name || "Mecd Voice";

        const realRoomId =
            room.id || roomId;


        // =====================================
        // حفظ بيانات الغرفة
        // =====================================

        localStorage.setItem(
            "roomName",
            realRoomName
        );

        localStorage.setItem(
            "roomId",
            realRoomId
        );


        // =====================================
        // عرض اسم الغرفة
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
        // الرسائل
        // =====================================

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


                            // =================================
                            // رسالة صوتية
                            // =================================

                            if (
                                data.type === "audio" &&
                                data.audioUrl
                            ) {

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
                            // رسالة نصية
                            // =================================

                            else {

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

                            }


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
                        "Messages listener error:",
                        error
                    );

                }
            );

        }


        // =====================================
        // إرسال الرسائل النصية
        // =====================================

        if (
            sendBtn &&
            input &&
            messagesRef
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
                        localStorage.getItem("userName") ||
                        "مستخدم";


                    const userPhoto =
                        localStorage.getItem("userPhoto") ||
                        "default.png";


                    try {

                        await addDoc(
                            messagesRef,
                            {
                                type: "text",
                                text: text,
                                user: userName,
                                photo: userPhoto,
                                time: serverTimestamp()
                            }
                        );


                        input.value = "";

                    } catch (error) {

                        console.error(
                            "Send message error:",
                            error
                        );

                    }

                }
            );


            input.addEventListener(
                "keydown",
                (event) => {

                    if (event.key === "Enter") {

                        sendBtn.click();

                    }

                }
            );

        }


        // =====================================
        // 🎤 تسجيل الصوت
        // =====================================

        let mediaRecorder = null;
        let audioChunks = [];
        let isRecording = false;


        if (voiceBtn) {

            voiceBtn.addEventListener(
                "click",
                async () => {

                    // =================================
                    // بدء التسجيل
                    // =================================

                    if (!isRecording) {

                        try {

                            if (
                                !navigator.mediaDevices ||
                                !navigator.mediaDevices.getUserMedia
                            ) {

                                throw new Error(
                                    "getUserMedia is not supported"
                                );

                            }


                            console.log("🎤 عم نطلب صلاحية الميكروفون...");

const stream = await navigator.mediaDevices.getUserMedia({
    audio: true
});

console.log("✅ الميكروفون اشتغل فعلاً", stream);
                                });


                            audioChunks = [];


                            // =================================
                            // اختيار صيغة مدعومة
                            // =================================

                            let mimeType =
                                "audio/webm";


                            if (
                                MediaRecorder.isTypeSupported(
                                    "audio/webm;codecs=opus"
                                )
                            ) {

                                mimeType =
                                    "audio/webm;codecs=opus";

                            }

                            else if (
                                MediaRecorder.isTypeSupported(
                                    "audio/webm"
                                )
                            ) {

                                mimeType =
                                    "audio/webm";

                            }

                            else if (
                                MediaRecorder.isTypeSupported(
                                    "audio/mp4"
                                )
                            ) {

                                mimeType =
                                    "audio/mp4";

                            }

                            else if (
                                MediaRecorder.isTypeSupported(
                                    "audio/ogg;codecs=opus"
                                )
                            ) {

                                mimeType =
                                    "audio/ogg;codecs=opus";

                            }


                            console.log(
                                "🎤 Audio format:",
                                mimeType
                            );


                            mediaRecorder =
                                new MediaRecorder(
                                    stream,
                                    {
                                        mimeType:
                                            mimeType
                                    }
                                );


                            // =================================
                            // استقبال بيانات الصوت
                            // =================================

                            mediaRecorder.addEventListener(
                                "dataavailable",
                                (event) => {

                                    if (
                                        event.data &&
                                        event.data.size > 0
                                    ) {

                                        audioChunks.push(
                                            event.data
                                        );

                                    }

                                }
                            );


                            // =================================
                            // عند إيقاف التسجيل
                            // =================================

                            mediaRecorder.addEventListener(
                                "stop",
                                async () => {

                                    try {

                                        console.log(
                                            "🎤 Audio chunks:",
                                            audioChunks.length
                                        );


                                        if (
                                            audioChunks.length === 0
                                        ) {

                                            throw new Error(
                                                "No audio data recorded"
                                            );

                                        }


                                        // =================================
                                        // إنشاء ملف الصوت
                                        // =================================

                                        const audioBlob =
                                            new Blob(
                                                audioChunks,
                                                {
                                                    type:
                                                        mimeType
                                                }
                                            );


                                        console.log(
                                            "🎤 Audio size:",
                                            audioBlob.size
                                        );


                                        if (
                                            audioBlob.size === 0
                                        ) {

                                            throw new Error(
                                                "Audio blob is empty"
                                            );

                                        }


                                        // =================================
                                        // امتداد الملف
                                        // =================================

                                        let extension =
                                            "webm";


                                        if (
                                            mimeType.includes(
                                                "mp4"
                                            )
                                        ) {

                                            extension =
                                                "mp4";

                                        }

                                        else if (
                                            mimeType.includes(
                                                "ogg"
                                            )
                                        ) {

                                            extension =
                                                "ogg";

                                        }


                                        // =================================
                                        // اسم الملف
                                        // =================================

                                        const fileName =
                                            `rooms/${realRoomId}/audio/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;


                                        // =================================
                                        // Firebase Storage
                                        // =================================

                                        const audioRef =
                                            ref(
                                                storage,
                                                fileName
                                            );


                                        await uploadBytes(
                                            audioRef,
                                            audioBlob,
                                            {
                                                contentType:
                                                    mimeType
                                            }
                                        );


                                        console.log(
                                            "✅ Audio uploaded"
                                        );


                                        // =================================
                                        // رابط الصوت
                                        // =================================

                                        const audioUrl =
                                            await getDownloadURL(
                                                audioRef
                                            );


                                        console.log(
                                            "✅ Audio URL:",
                                            audioUrl
                                        );


                                        // =================================
                                        // المستخدم
                                        // =================================

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


                                        // =================================
                                        // حفظ الصوت في Firestore
                                        // =================================

                                        const audioMessage =
                                            await addDoc(
                                                messagesRef,
                                                {
                                                    type:
                                                        "audio",

                                                    audioUrl:
                                                        audioUrl,

                                                    user:
                                                        userName,

                                                    photo:
                                                        userPhoto,

                                                    time:
                                                        serverTimestamp()
                                                }
                                            );


                                        console.log(
                                            "✅ Audio message saved:",
                                            audioMessage.id
                                        );


                                    } catch (error) {

                                        console.error(
                                            "❌ Audio error:",
                                            error
                                        );


                                        alert(
                                            isTurkish
                                                ? "❌ Ses gönderilemedi."
                                                : "❌ تعذر إرسال التسجيل الصوتي."
                                        );

                                    }


                                    // =================================
                                    // إيقاف الميكروفون
                                    // =================================

                                    stream
                                        .getTracks()
                                        .forEach(
                                            (track) => {
                                                track.stop();
                                            }
                                        );


                                    mediaRecorder =
                                        null;

                                    audioChunks = [];

                                }
                            );


                            // =================================
                            // تشغيل التسجيل
                            // =================================

                            mediaRecorder.start(
                                1000
                            );


                            isRecording = true;


                            console.log(
                                "🎤 Recording started"
                            );


                        } catch (error) {

                            console.error(
                                "❌ Recording error:",
                                error
                            );


                            alert(
                                isTurkish
                                    ? "❌ Mikrofon açılamadı."
                                    : "❌ لم يتم تشغيل الميكروفون."
                            );

                        }

                    }


                    // =================================
                    // إيقاف التسجيل
                    // =================================

                    else {

                        if (
                            mediaRecorder &&
                            mediaRecorder.state !== "inactive"
                        ) {

                            mediaRecorder.stop();

                        }


                        isRecording = false;


                        console.log(
                            "⏹️ Recording stopped"
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
            "Room loading error:",
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
