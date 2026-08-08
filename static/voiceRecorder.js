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


let mediaRecorder = null;
let audioChunks = [];
let currentStream = null;

let currentRoomId = null;
let currentMessagesRef = null;


export async function startVoiceRecording(roomId, messagesRef) {

    currentRoomId = roomId;
    currentMessagesRef = messagesRef;

    if (!currentRoomId) {
        throw new Error("Room ID غير موجود");
    }

    if (!currentMessagesRef) {
        throw new Error("messagesRef غير موجود");
    }


    currentStream =
        await navigator.mediaDevices.getUserMedia({
            audio: true
        });


    audioChunks = [];


    let mimeType = "audio/webm";

    if (
        MediaRecorder.isTypeSupported(
            "audio/webm;codecs=opus"
        )
    ) {
        mimeType = "audio/webm;codecs=opus";
    }


    mediaRecorder =
        new MediaRecorder(
            currentStream,
            {
                mimeType: mimeType
            }
        );


    mediaRecorder.ondataavailable = (event) => {

        if (
            event.data &&
            event.data.size > 0
        ) {

            audioChunks.push(event.data);

        }

    };


    mediaRecorder.start();

    console.log("🔴 بدأ تسجيل الصوت");
}


// =====================================
// ⏹️ إيقاف التسجيل
// =====================================

export function stopVoiceRecording() {

    return new Promise((resolve, reject) => {

        if (
            !mediaRecorder ||
            mediaRecorder.state === "inactive"
        ) {

            resolve(null);

            return;
        }


        const recorder = mediaRecorder;


        recorder.onstop = async () => {

            try {

                console.log("⏹️ التسجيل توقف");


                if (audioChunks.length === 0) {

                    throw new Error(
                        "لا يوجد تسجيل صوتي"
                    );

                }


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


                const fileName =
                    `rooms/${currentRoomId}/audio/${Date.now()}.webm`;


                const audioRef =
                    ref(
                        storage,
                        fileName
                    );


                // رفع الصوت
                await uploadBytes(
                    audioRef,
                    audioBlob,
                    {
                        contentType: "audio/webm"
                    }
                );


                console.log(
                    "✅ تم رفع الصوت"
                );


                // رابط الصوت
                const audioUrl =
                    await getDownloadURL(
                        audioRef
                    );


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
                // بيانات الرسالة
                // =================================

                const audioMessage = {

                    type: "audio",

                    audioUrl: audioUrl,

                    user: userName,

                    photo: userPhoto,

                    time: serverTimestamp()

                };


                // حفظ في Firestore
                await addDoc(
                    currentMessagesRef,
                    audioMessage
                );


                console.log(
                    "✅ تم حفظ الصوت في Firestore"
                );


                // نرجع البيانات إلى room.js
                resolve({

                    type: "audio",

                    audioUrl: audioUrl,

                    user: userName,

                    photo: userPhoto

                });


            } catch (error) {

                console.error(
                    "❌ خطأ في التسجيل:",
                    error
                );


                reject(error);

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

        };


        recorder.stop();

    });

}
