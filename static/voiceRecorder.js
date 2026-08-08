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

    if (!roomId) {
        throw new Error("Room ID غير موجود");
    }

    if (!messagesRef) {
        throw new Error("messagesRef غير موجود");
    }

    currentRoomId = roomId;
    currentMessagesRef = messagesRef;
    audioChunks = [];

    try {

        console.log("🎤 Room ID:", currentRoomId);

        // =====================================
        // 🎙️ تشغيل الميكروفون
        // =====================================

        currentStream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });


        // =====================================
        // 🎧 اختيار نوع التسجيل
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
        // إنشاء MediaRecorder
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
            "🎙️ نوع التسجيل:",
            mediaRecorder.mimeType
        );


        // =====================================
        // 🎧 استقبال الصوت
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

                    console.log(
                        "🎧 جزء صوت:",
                        event.data.size
                    );

                }

            }
        );


        // =====================================
        // ⏹️ انتهاء التسجيل
        // =====================================

        mediaRecorder.addEventListener(
            "stop",
            async () => {

                console.log(
                    "🟡 STOP EVENT اشتغل"
                );


                try {

                    // =================================
                    // التأكد من وجود الصوت
                    // =================================

                    if (
                        audioChunks.length === 0
                    ) {

                        throw new Error(
                            "لم يتم التقاط أي صوت"
                        );

                    }


                    console.log(
                        "✅ عدد أجزاء الصوت:",
                        audioChunks.length
                    );


                    // =================================
                    // إنشاء Blob
                    // =================================

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
                        "🎤 حجم التسجيل:",
                        audioBlob.size
                    );


                    if (
                        audioBlob.size === 0
                    ) {

                        throw new Error(
                            "ملف الصوت فارغ"
                        );

                    }


                    // =================================
                    // 👤 بيانات المستخدم
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
                    // 📁 Firebase Storage
                    // =================================

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
                        "⬆️ جاري رفع التسجيل إلى Firebase..."
                    );


                    await uploadBytes(
                        audioRef,
                        audioBlob,
                        {
                            contentType: finalType
                        }
                    );


                    console.log(
                        "✅ تم رفع التسجيل إلى Storage"
                    );


                    // =================================
                    // 🔗 رابط الصوت
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
                    // 🗄️ Firestore
                    // =================================

                    const messageData = {

                        type: "audio",

                        audioUrl:
                            audioUrl,

                        user:
                            userName,

                        photo:
                            userPhoto,

                        time:
                            serverTimestamp()

                    };


                    console.log(
                        "📤 جاري حفظ التسجيل في Firestore..."
                    );


                    const messageDoc =
                        await addDoc(
                            currentMessagesRef,
                            messageData
                        );


                    console.log(
                        "✅ تم حفظ التسجيل:",
                        messageDoc.id
                    );


                    // =================================
                    // 🎧 إظهار التسجيل في الدردشة
                    // =================================
                    //
                    // نعرضه بعد الحفظ في Firebase
                    // حتى لا يختفي عند تحديث Snapshot.
                    // =================================

                    const messagesBox =
                        document.getElementById(
                            "messages"
                        );


                    if (messagesBox) {

                        const messageDiv =
                            document.createElement(
                                "div"
                            );


                        messageDiv.className =
                            "message";


                        messageDiv.dataset.messageId =
                            messageDoc.id;


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
                                src="${audioUrl}"
                                style="
                                    width:100%;
                                    margin-top:10px;
                                "
                            ></audio>

                        `;


                        // منع التكرار إذا كانت
                        // room.js قد عرضتها مسبقًا

                        const alreadyExists =
                            messagesBox.querySelector(
                                `[data-message-id="${messageDoc.id}"]`
                            );


                        if (!alreadyExists) {

                            messagesBox.appendChild(
                                messageDiv
                            );

                        }


                        messagesBox.scrollTop =
                            messagesBox.scrollHeight;


                        console.log(
                            "🎧 ظهر التسجيل في الدردشة"
                        );

                    }


                } catch (error) {

                    console.error(
                        "❌ Voice Recorder Error:",
                        error
                    );


                    alert(
                        "❌ خطأ التسجيل:\n\n" +
                        error.message
                    );

                }


                // =================================
                // إغلاق الميكروفون
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

                currentRoomId =
                    null;

                currentMessagesRef =
                    null;

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
            "❌ خطأ في بدء التسجيل:",
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

        currentRoomId =
            null;

        currentMessagesRef =
            null;


        throw error;

    }

}


// =====================================
// ⏹️ إيقاف التسجيل
// =====================================

export function stopVoiceRecording() {

    console.log(
        "⏹️ محاولة إيقاف التسجيل"
    );


    if (
        mediaRecorder &&
        mediaRecorder.state !== "inactive"
    ) {

        console.log(
            "🟡 حالة المسجل:",
            mediaRecorder.state
        );


        mediaRecorder.stop();


        console.log(
            "✅ تم طلب إيقاف التسجيل"
        );


        return true;

    }


    console.log(
        "⚠️ لا يوجد تسجيل قيد التشغيل"
    );


    return false;

}
