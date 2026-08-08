// =====================================
// 🎤 voiceRecorder.js
// تسجيل الصوت + رفعه + حفظه في Firestore
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

export async function startVoiceRecording(roomId, messagesRef) {

    currentRoomId = roomId;
    currentMessagesRef = messagesRef;

    console.log("🎤 Room:", currentRoomId);
    console.log("🎤 MessagesRef:", currentMessagesRef);

    if (!currentRoomId) {
        throw new Error("Room ID غير موجود");
    }

    if (!currentMessagesRef) {
        throw new Error("messagesRef غير موجود");
    }


    try {

        // تشغيل الميكروفون
        currentStream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });


        audioChunks = [];


        // =================================
        // تحديد نوع التسجيل
        // =================================

        let mimeType = "";

        if (
            MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ) {

            mimeType = "audio/webm;codecs=opus";

        } else if (
            MediaRecorder.isTypeSupported("audio/webm")
        ) {

            mimeType = "audio/webm";

        }


        console.log(
            "🎤 MIME:",
            mimeType || "default"
        );


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
        // استقبال الصوت
        // =================================

        mediaRecorder.ondataavailable = (event) => {

            if (
                event.data &&
                event.data.size > 0
            ) {

                audioChunks.push(event.data);

                console.log(
                    "🎤 Audio chunk:",
                    event.data.size
                );

            }

        };


        // =================================
        // بدء التسجيل
        // =================================

        mediaRecorder.start();

        console.log("🔴 بدأ التسجيل");

    } catch (error) {

        console.error(
            "❌ خطأ في تشغيل الميكروفون:",
            error
        );


        if (currentStream) {

            currentStream
                .getTracks()
                .forEach(track => track.stop());

        }


        currentStream = null;
        mediaRecorder = null;

        throw error;
    }
}


// =====================================
// ⏹️ إيقاف التسجيل وحفظه
// =====================================

export function stopVoiceRecording() {

    return new Promise((resolve, reject) => {

        if (
            !mediaRecorder ||
            mediaRecorder.state === "inactive"
        ) {

            resolve();

            return;
        }


        const recorder = mediaRecorder;


        recorder.onstop = async () => {

            try {

                console.log("⏹️ التسجيل توقف");

                // =================================
                // التأكد من وجود الصوت
                // =================================

                if (audioChunks.length === 0) {

                    throw new Error(
                        "لم يتم الحصول على بيانات صوتية"
                    );

                }


                // =================================
                // إنشاء Blob
                // =================================

                const audioBlob =
                    new Blob(
                        audioChunks,
                        {
                            type:
                                recorder.mimeType ||
                                "audio/webm"
                        }
                    );


                console.log(
                    "🎤 حجم التسجيل:",
                    audioBlob.size
                );


                if (audioBlob.size === 0) {

                    throw new Error(
                        "ملف الصوت فارغ"
                    );

                }


                // =================================
                // اسم الملف
                // =================================

                const extension =
                    recorder.mimeType &&
                    recorder.mimeType.includes("webm")
                        ? "webm"
                        : "webm";


                const fileName =
                    `rooms/${currentRoomId}/audio/${Date.now()}.${extension}`;


                console.log(
                    "📁 Storage path:",
                    fileName
                );


                // =================================
                // رفع الصوت إلى Storage
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
                            recorder.mimeType ||
                            "audio/webm"
                    }
                );


                console.log(
                    "✅ تم رفع الصوت إلى Storage"
                );


                // =================================
                // الحصول على الرابط
                // =================================

                const audioUrl =
                    await getDownloadURL(
                        audioRef
                    );


                console.log(
                    "🔗 Audio URL:",
                    audioUrl
                );


                // =================================
                // بيانات المستخدم
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

                console.log(
                    "💾 جاري حفظ الصوت في Firestore..."
                );


                const messageDoc =
                    await addDoc(
                        currentMessagesRef,
                        {

                            type: "audio",

                            audioUrl: audioUrl,

                            user: userName,

                            photo: userPhoto,

                            time:
                                serverTimestamp()

                        }
                    );


                console.log(
                    "✅ تم حفظ الصوت في Firestore:",
                    messageDoc.id
                );


                // =================================
                // تنظيف
                // =================================

                resolve();


            } catch (error) {

                console.error(
                    "❌ خطأ في إرسال الصوت:",
                    error
                );


                reject(error);


            } finally {

                // إيقاف الميكروفون

                if (currentStream) {

                    currentStream
                        .getTracks()
                        .forEach(track => {
                            track.stop();
                        });

                }


                currentStream = null;
                mediaRecorder = null;
                audioChunks = [];
                currentRoomId = null;
                currentMessagesRef = null;

            }

        };


        // =================================
        // إرسال آخر جزء من التسجيل
        // =================================

        recorder.requestData();

        recorder.stop();

    });
}
