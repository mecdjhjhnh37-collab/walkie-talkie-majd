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

        // =====================================
        // التأكد من البيانات
        // =====================================

        if (!currentRoomId) {
            throw new Error("Room ID غير موجود");
        }

        if (!currentMessagesRef) {
            throw new Error("messagesRef غير موجود");
        }


        console.log(
            "🎤 Room ID:",
            currentRoomId
        );


        // =====================================
        // تشغيل الميكروفون
        // =====================================

        currentStream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });


        audioChunks = [];


        // =====================================
        // تحديد نوع الصوت
        // =====================================

        let mimeType = "";

        const types = [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/ogg;codecs=opus"
        ];


        for (const type of types) {

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

        if (mimeType) {

            mediaRecorder =
                new MediaRecorder(
                    currentStream,
                    {
                        mimeType: mimeType
                    }
                );

        } else {

            mediaRecorder =
                new MediaRecorder(
                    currentStream
                );

        }


        console.log(
            "🎙️ نوع التسجيل:",
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

                    console.log(
                        "🎧 جزء صوت:",
                        event.data.size
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

        console.log("🟡 STOP EVENT اشتغل");

        try {

            if (audioChunks.length === 0) {
                throw new Error("❌ audioChunks فارغة");
            }

            console.log(
                "✅ عدد أجزاء الصوت:",
                audioChunks.length
            );


            // ===============================
            // إنشاء ملف الصوت
            // ===============================

            const finalType =
                mediaRecorder.mimeType ||
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


            if (audioBlob.size === 0) {
                throw new Error("❌ التسجيل فارغ");
            }


            // ===============================
            // إظهار التسجيل فورًا
            // ===============================

            const localUrl =
                URL.createObjectURL(audioBlob);


            const messagesBox =
                document.getElementById("messages");


            if (messagesBox) {

                const testMessage =
                    document.createElement("div");


                testMessage.className =
                    "message";


                testMessage.innerHTML = `

                    <div class="message-text">
                        🎤 تسجيل صوتي
                    </div>

                    <audio
                        controls
                        src="${localUrl}"
                        style="
                            width:100%;
                            margin-top:10px;
                        "
                    ></audio>

                `;


                messagesBox.appendChild(
                    testMessage
                );


                messagesBox.scrollTop =
                    messagesBox.scrollHeight;


                console.log(
                    "✅ ظهر التسجيل محليًا في الدردشة"
                );

            } else {

                console.error(
                    "❌ عنصر messages غير موجود"
                );

            }


            // ===============================
            // بيانات المستخدم
            // ===============================

            const userName =
                localStorage.getItem("userName") ||
                "مستخدم";


            const userPhoto =
                localStorage.getItem("userPhoto") ||
                "default.png";


            // ===============================
            // Firebase Storage
            // ===============================

            const extension =
                finalType.includes("ogg")
                    ? "ogg"
                    : "webm";


            const fileName =
                `rooms/${currentRoomId}/audio/${Date.now()}.${extension}`;


            console.log(
                "📁 Storage path:",
                fileName
            );


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
                    contentType: finalType
                }
            );


            console.log(
                "✅ تم رفع الصوت إلى Storage"
            );


            // ===============================
            // رابط الصوت
            // ===============================

            const audioUrl =
                await getDownloadURL(
                    audioRef
                );


            console.log(
                "🔗 Audio URL:",
                audioUrl
            );


            // ===============================
            // Firestore
            // ===============================

            const messageData = {

                type: "audio",

                audioUrl: audioUrl,

                user: userName,

                photo: userPhoto,

                time: serverTimestamp()

            };


            console.log(
                "📤 جاري حفظ الرسالة في Firestore..."
            );


            const messageDoc =
                await addDoc(
                    currentMessagesRef,
                    messageData
                );


            console.log(
                "✅ تم حفظ التسجيل في Firestore:",
                messageDoc.id
            );


        } catch (error) {

            console.error(
                "❌ Voice Recorder Error:",
                error
            );


            alert(
                "❌ خطأ التسجيل:\n" +
                error.message
            );


        } finally {

            if (currentStream) {

                currentStream
                    .getTracks()
                    .forEach(
                        track => track.stop()
                    );

            }


            currentStream = null;

            mediaRecorder = null;

            audioChunks = [];

        }

    }
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
                            "ملف التسجيل فارغ"
                        );

                    }


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
                    // اسم الملف
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


                    // =================================
                    // رفع الصوت
                    // =================================

                    console.log(
                        "⬆️ جاري رفع الصوت..."
                    );


                    await uploadBytes(
                        audioRef,
                        audioBlob,
                        {
                            contentType:
                                finalType
                        }
                    );


                    console.log(
                        "✅ تم رفع الصوت إلى Storage"
                    );


                    // =================================
                    // رابط الصوت
                    // =================================

                    const audioUrl =
                        await getDownloadURL(
                            audioRef
                        );


                    console.log(
                        "🔗 رابط الصوت جاهز:",
                        audioUrl
                    );


                    // =================================
                    // حفظ الصوت في Firestore
                    // =================================

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
                        "✅ تم حفظ التسجيل في Firestore:",
                        messageDoc.id
                    );


                    // =================================
                    // 🎧 إظهار التسجيل فورًا بالدردشة
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


                        messagesBox.appendChild(
                            messageDiv
                        );


                        messagesBox.scrollTop =
                            messagesBox.scrollHeight;


                        console.log(
                            "🎧 ظهر التسجيل في الدردشة"
                        );

                    } else {

                        console.error(
                            "❌ لم نجد عنصر messages"
                        );

                    }


                    // =================================
                    // إرسال حدث اختياري
                    // =================================

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
                        "❌ خطأ كامل في التسجيل:",
                        error
                    );


                    alert(
                        "❌ لم يتم إرسال التسجيل الصوتي\n\n" +
                        error.message
                    );


                } finally {

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

                }

            }
        );


        // =====================================
        // بدء التسجيل
        // =====================================

        mediaRecorder.start();


        console.log(
            "🔴 بدأ تسجيل الصوت"
        );


    } catch (error) {

        console.error(
            "❌ خطأ في بدء
            mediaRecorder.state
