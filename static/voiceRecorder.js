// =====================================
// 🎤 voiceRecorder.js
// تسجيل الصوت + Firebase Storage + Firestore
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
// 🎤 بدء التسجيل
// =====================================

export async function startVoiceRecording(
    roomId,
    messagesRef
) {

    currentRoomId = roomId;
    currentMessagesRef = messagesRef;

    try {

        // تشغيل الميكروفون
        currentStream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });


        audioChunks = [];


        // =====================================
        // إنشاء MediaRecorder
        // =====================================

        let mimeType = "audio/webm";

        if (
            !MediaRecorder.isTypeSupported("audio/webm")
        ) {
            mimeType = "";
        }


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

                    audioChunks.push(
                        event.data
                    );

                }

            }
        );


        // =====================================
        // عند إيقاف التسجيل
        // =====================================

        mediaRecorder.addEventListener(
            "stop",
            async () => {

                try {

                    console.log(
                        "⏹️ توقف التسجيل"
                    );


                    if (
                        audioChunks.length === 0
                    ) {

                        throw new Error(
                            "لم يتم تسجيل أي صوت"
                        );

                    }


                    // =====================================
                    // إنشاء ملف الصوت
                    // =====================================

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
                        "🎤 حجم التسجيل:",
                        audioBlob.size
                    );


                    // =====================================
                    // رفع الصوت إلى Firebase Storage
                    // =====================================

                    const fileName =
                        `rooms/${currentRoomId}/audio/${Date.now()}.webm`;


                    const audioRef =
                        ref(
                            storage,
                            fileName
                        );


                    console.log(
                        "⬆️ جاري رفع التسجيل..."
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
                        "✅ تم رفع التسجيل"
                    );


                    // =====================================
                    // الحصول على رابط الصوت
                    // =====================================

                    const audioUrl =
                        await getDownloadURL(
                            audioRef
                        );


                    console.log(
                        "🔗 رابط الصوت جاهز"
                    );


                    // =====================================
                    // حفظ الصوت في Firestore
                    // =====================================

                    if (!currentMessagesRef) {

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
                        "✅ تم حفظ التسجيل في Firestore"
                    );


                } catch (error) {

                    console.error(
                        "❌ خطأ في إرسال التسجيل:",
                        error
                    );


                    alert(
                        "❌ لم يتم إرسال التسجيل الصوتي"
                    );

                }


                // =====================================
                // إغلاق الميكروفون
                // =====================================

                if (currentStream) {

                    currentStream
                        .getTracks()
                        .forEach(
                            (track) => {
                                track.stop();
                            }
                        );

                }


                currentStream = null;

                mediaRecorder = null;

                audioChunks = [];

            }
        );


        // =====================================
        // 🔴 بدء التسجيل
        // =====================================

        mediaRecorder.start();


        console.log(
            "🔴 بدأ تسجيل الصوت"
        );

    } catch (error) {

        console.error(
            "❌ خطأ في تشغيل الميكروفون:",
            error
        );


        if (currentStream) {

            currentStream
                .getTracks()
                .forEach(
                    (track) => {
                        track.stop();
                    }
                );

        }


        currentStream = null;

        mediaRecorder = null;

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
            "⏹️ جاري إيقاف التسجيل..."
        );


        mediaRecorder.stop();

    }

}
