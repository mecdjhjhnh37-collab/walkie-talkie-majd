// =====================================
// 🎤 voiceRecorder.js
// تسجيل الصوت + Cloudinary + Firestore
// =====================================

import {
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// =====================================
// ☁️ Cloudinary
// =====================================

const CLOUDINARY_CLOUD_NAME = "slm8tluf";
const CLOUDINARY_UPLOAD_PRESET = "voice_upload";


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
        // 🎧 استقبال أجزاء الصوت
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
                    // ☁️ رفع الصوت إلى Cloudinary
                    // =================================

                    console.log(
                        "☁️ جاري رفع التسجيل إلى Cloudinary..."
                    );


                    const uploadUrl =
                        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;


                    const formData =
                        new FormData();


                    formData.append(
                        "file",
                        audioBlob,
                        `voice_${Date.now()}.webm`
                    );


                    formData.append(
                        "upload_preset",
                        CLOUDINARY_UPLOAD_PRESET
                    );


                    const cloudinaryResponse =
                        await fetch(
                            uploadUrl,
                            {
                                method: "POST",
                                body: formData
                            }
                        );


                    if (
                        !cloudinaryResponse.ok
                    ) {

                        const errorText =
                            await cloudinaryResponse.text();

                        console.error(
                            "Cloudinary Error:",
                            errorText
                        );

                        throw new Error(
                            "فشل رفع الصوت إلى Cloudinary"
                        );

                    }


                    const cloudinaryData =
                        await cloudinaryResponse.json();


                    console.log(
                        "✅ تم رفع الصوت إلى Cloudinary"
                    );


                    // =================================
                    // 🔗 رابط الصوت
                    // =================================

                    const audioUrl =
                        cloudinaryData.secure_url;


                    if (!audioUrl) {

                        throw new Error(
                            "Cloudinary لم يرجع رابط الصوت"
                        );

                    }


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
                        (
                            error.message ||
                            error
                        )
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
