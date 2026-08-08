// =====================================
// 🎤 voiceRecorder.js
// تسجيل الصوت + رفعه إلى Firebase
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

    try {

        currentStream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });


        audioChunks = [];


        // =================================
        // نوع التسجيل
        // =================================

        let mimeType = "audio/webm";

        if (
            !MediaRecorder.isTypeSupported(
                "audio/webm"
            )
        ) {

            mimeType = "";

        }


        // =================================
        // إنشاء MediaRecorder
        // =================================

        mediaRecorder =
            mimeType
                ? new MediaRecorder(
                    currentStream,
                    {
                        mimeType: mimeType
                    }
                )
                : new MediaRecorder(
                    currentStream
                );


        // =================================
        // استقبال أجزاء الصوت
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
                        "🎤 التسجيل توقف"
                    );


                    if (
                        audioChunks.length === 0
                    ) {

                        console.error(
                            "❌ لا يوجد صوت مسجل"
                        );

                        return;

                    }


                    // =================================
                    // إنشاء ملف الصوت
                    // =================================

                    const audioBlob =
                        new Blob(
                            audioChunks,
                            {
                                type:
                                    mimeType ||
                                    "audio/webm"
                            }
                        );


                    console.log(
                        "🎤 حجم الصوت:",
                        audioBlob.size
                    );


                    // =================================
                    // اسم الملف
                    // =================================

                    const fileName =
                        `rooms/${currentRoomId}/audio/${Date.now()}.webm`;


                    // =================================
                    // Firebase Storage
                    // =================================

                    const audioRef =
                        ref(
                            storage,
                            fileName
                        );


                    console.log(
                        "⬆️ جاري رفع الصوت..."
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
                    // رابط الصوت
                    // =================================

                    const audioUrl =
                        await getDownloadURL(
                            audioRef
                        );


                    console.log(
                        "🔗 رابط الصوت:",
                        audioUrl
                    );


                    // =================================
                    // حفظ الرسالة في Firestore
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

                            type: "audio",

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
                        "❌ خطأ في حفظ التسجيل:",
                        error
                    );

                    alert(
                        "❌ لم يتم إرسال التسجيل الصوتي"
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


        // =================================
        // بدء التسجيل
        // =================================

        mediaRecorder.start();


        console.log(
            "🔴 بدأ تسجيل الصوت"
        );


    } catch (error) {

        console.error(
            "❌ خطأ في تشغيل الميكروفون:",
            error
        );


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


        throw error;

    }

}


// =====================================
// ⏹️ إيقاف التسجيل
// =====================================

export function stopVoiceRecording() {

    if (
        mediaRecorder &&
        mediaRecorder.state !== "inactive"
    ) {

        console.log(
            "⏹️ إيقاف التسجيل..."
        );

        mediaRecorder.stop();

    }

}
