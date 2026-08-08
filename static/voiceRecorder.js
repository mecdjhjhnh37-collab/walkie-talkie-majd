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

        if (!currentRoomId) {
            throw new Error("Room ID غير موجود");
        }

        if (!currentMessagesRef) {
            throw new Error("messagesRef غير موجود");
        }


        // =====================================
        // 🎙️ تشغيل الميكروفون
        // =====================================

        currentStream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });


        audioChunks = [];


        // =====================================
        // 🎧 تحديد نوع التسجيل
        // =====================================

        let mimeType = "";

        const supportedTypes = [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/ogg;codecs=opus"
        ];

        for (const type of supportedTypes) {

            if (
                MediaRecorder.isTypeSupported(type)
            ) {

                mimeType = type;
                break;

            }

        }


        // =====================================
        // إنشاء المسجل
        // =====================================

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


        console.log(
            "🎙️ MediaRecorder:",
            mediaRecorder.mimeType
        );


        // =====================================
        // استقبال أجزاء الصوت
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
        // عند انتهاء التسجيل
        // =====================================

        mediaRecorder.addEventListener(
            "stop",
            async () => {

                try {

                    console.log(
                        "⏹️ انتهى التسجيل"
                    );


                    if (
                        audioChunks.length === 0
                    ) {

                        throw new Error(
                            "لم يتم التقاط الصوت"
                        );

                    }


                    // =====================================
                    // إنشاء Blob
                    // =====================================

                    const finalType =
                        mediaRecorder?.mimeType ||
                        mimeType ||
                        "audio/webm";


                    const audioBlob =
                        new Blob(
                            audioChunks,
                            {
                                type: finalType
                            }
                        );


                    console.log(
                        "🎤 حجم الملف:",
                        audioBlob.size
                    );


                    if (audioBlob.size === 0) {

                        throw new Error(
                            "ملف الصوت فارغ"
                        );

                    }


                    // =====================================
                    // 👤 بيانات المستخدم
                    // =====================================

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


                    // =====================================
                    // 📁 اسم ملف Firebase Storage
                    // =====================================

                    const extension =
                        finalType.includes("ogg")
                            ? "ogg"
                            : "webm";


                    const fileName =
                        `rooms/${currentRoomId}/audio/${Date.now()}.${extension}`;


                    const audioRef =
                        ref(
                            storage,
                            fileName
                        );


                    console.log(
                        "⬆️ رفع الصوت إلى Firebase..."
                    );


                    // =====================================
                    // ⬆️ رفع الصوت
                    // =====================================

                    await uploadBytes(
                        audioRef,
                        audioBlob,
                        {
                            contentType: finalType
                        }
                    );


                    console.log(
                        "✅ تم رفع الصوت"
                    );


                    // =====================================
                    // 🔗 رابط التحميل
                    // =====================================

                    const audioUrl =
                        await getDownloadURL(
                            audioRef
                        );


                    console.log(
                        "🔗 رابط الصوت:",
                        audioUrl
                    );


                    // =====================================
                    // 🗄️ حفظ الرسالة في Firestore
                    // =====================================

                    const messageData = {

                        type: "audio",

                        audioUrl: audioUrl,

                        user: userName,

                        photo: userPhoto,

                        time: serverTimestamp()

                    };


                    const messageDoc =
                        await addDoc(
                            currentMessagesRef,
                            messageData
                        );


                    console.log(
                        "✅ تم حفظ الصوت في Firestore:",
                        messageDoc.id
                    );


                    // =====================================
                    // 📢 إرسال حدث إلى room.js
                    // =====================================
                    // هذا فقط لإظهار الصوت فورًا.
                    // لا يحتوي أي منطق تسجيل.

                    window.dispatchEvent(
                        new CustomEvent(
                            "voiceMessageSent",
                            {
                                detail: {

                                    id:
                                        messageDoc.id,

                                    type:
                                        "audio",

                                    audioUrl:
                                        audioUrl,

                                    user:
                                        userName,

                                    photo:
                                        userPhoto

                                }
                            }
                        )
                    );


                } catch (error) {

                    console.error(
                        "❌ خطأ في حفظ التسجيل:",
                        error
                    );


                    alert(
                        "❌ لم يتم إرسال التسجيل الصوتي\n" +
                        error.message
                    );


                } finally {

                    // =================================
                    // 🎙️ إغلاق الميكروفون
                    // =================================

                    if (currentStream) {

                        currentStream
                            .getTracks()
                            .forEach(
                                (track) => {
                                    track.stop();
                                }
                            );

                    }


                    currentStream =
                        null;

                    mediaRecorder =
                        null;

                    audioChunks =
                        [];

                }

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


        currentStream =
            null;

        mediaRecorder =
            null;

        audioChunks =
            [];

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

        return true;

    }


    console.log(
        "⚠️ لا يوجد تسجيل قيد التشغيل"
    );


    return false;

}
