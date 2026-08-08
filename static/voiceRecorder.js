// =====================================
// 🎤 voiceRecorder.js
// تسجيل الصوت + Firebase
// =====================================

import { storage } from "./app.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import {
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================
// المتغيرات
// =====================================

let mediaRecorder = null;
let audioChunks = [];
let currentStream = null;

let currentRoomId = null;
let currentMessagesRef = null;


// =====================================
// ▶️ بدء التسجيل
// =====================================

export async function startVoiceRecording(
    roomId,
    messagesRef
) {

    currentRoomId = roomId;
    currentMessagesRef = messagesRef;

    currentStream =
        await navigator.mediaDevices.getUserMedia({
            audio: true
        });

    audioChunks = [];


    // =====================================
    // إنشاء المسجل
    // =====================================

    mediaRecorder =
        new MediaRecorder(currentStream);


    // =====================================
    // استقبال الصوت
    // =====================================

    mediaRecorder.addEventListener(
        "dataavailable",
        (event) => {

            if (
                event.data &&
                event.data.size > 0
            ) {

                audioChunks.push(event.data);

            }

        }
    );


    // =====================================
    // عند انتهاء التسجيل
    // =====================================

    mediaRecorder.addEventListener(
        "stop",
        async () => {

            try {

                console.log(
                    "🛑 STOP اشتغل"
                );

                console.log(
                    "🎤 عدد أجزاء الصوت:",
                    audioChunks.length
                );


                if (
                    audioChunks.length === 0
                ) {

                    throw new Error(
                        "لم يتم الحصول على بيانات صوت"
                    );

                }


                // =================================
                // إنشاء ملف الصوت
                // =================================

                const audioBlob =
                    new Blob(
                        audioChunks,
                        {
                            type: "audio/webm"
                        }
                    );


                console.log(
                    "🎤 حجم الصوت:",
                    audioBlob.size
                );


                // =================================
                // عرض الصوت مباشرة
                // =================================

                const localAudioUrl =
                    URL.createObjectURL(
                        audioBlob
                    );


                const messagesBox =
                    document.getElementById(
                        "messages"
                    );


                if (messagesBox) {

                    const audio =
                        document.createElement(
                            "audio"
                        );

                    audio.controls = true;

                    audio.preload = "metadata";

                    audio.src =
                        localAudioUrl;

                    audio.style.width =
                        "100%";

                    audio.style.marginTop =
                        "10px";

                    messagesBox.appendChild(
                        audio
                    );

                    messagesBox.scrollTop =
                        messagesBox.scrollHeight;

                }


                // =================================
                // Firebase Storage
                // =================================

                const fileName =
                    `rooms/${currentRoomId}/audio/${Date.now()}.webm`;


                const audioRef =
                    ref(
                        storage,
                        fileName
                    );


                console.log(
                    "⬆️ رفع الصوت إلى Firebase..."
                );


                await uploadBytes(
                    audioRef,
                    audioBlob,
                    {
                        contentType:
                            "audio/webm"
                    }
                );


                console.log(
                    "✅ تم رفع الصوت"
                );


                // =================================
                // رابط Firebase
                // =================================

                const audioUrl =
                    await getDownloadURL(
                        audioRef
                    );


                console.log(
                    "🔗 Firebase URL:",
                    audioUrl
                );


                // =================================
                // Firestore
                // =================================

                if (
                    !currentMessagesRef
                ) {

                    throw new Error(
                        "messagesRef غير موجود"
                    );

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


                await addDoc(
                    currentMessagesRef,
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
                    "✅ تم حفظ الصوت في Firestore"
                );


            } catch (error) {

                console.error(
                    "❌ Voice Firebase error:",
                    error
                );


                alert(
                    "❌ خطأ في إرسال الصوت:\n" +
                    error.message
                );

            }


            // =================================
            // إغلاق الميكروفون
            // =================================

            if (
                currentStream
            ) {

                currentStream
                    .getTracks()
                    .forEach(
                        track => {
                            track.stop();
                        }
                    );

            }


            currentStream =
                null;

            mediaRecorder =
                null;

            audioChunks = [];

        }
    );


    // =====================================
    // بدء التسجيل
    // =====================================

    mediaRecorder.start();

    console.log(
        "🔴 بدأ تسجيل الصوت"
    );

}


// =====================================
// ⏹️ إيقاف التسجيل
// =====================================

export function stopVoiceRecording() {

    if (
        mediaRecorder &&
        mediaRecorder.state === "recording"
    ) {

        console.log(
            "⏹️ إيقاف التسجيل..."
        );


        // نجبر MediaRecorder
        // على إرسال آخر جزء من الصوت

        mediaRecorder.requestData();

        mediaRecorder.stop();

    }

}
