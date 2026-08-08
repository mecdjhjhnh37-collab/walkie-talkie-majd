import { db, storage } from "./app.js";

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

    const roomTitle =
        document.getElementById("roomName");

    const roomIdText =
        document.getElementById("roomId");

    const messagesBox =
        document.getElementById("messages");

    const input =
        document.getElementById("messageInput");

    const sendBtn =
        document.getElementById("sendMessage");

    const voiceBtn =
        document.getElementById("voiceBtn");

    const callBtn =
        document.getElementById("callBtn");

    const videoBtn =
        document.getElementById("videoBtn");


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
    // room-000001  →  MC-000001
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


        // =================================
        // بيانات الغرفة
        // =================================

        const room =
            roomDoc.data();


        const realRoomName =
            room.name || "Mecd Voice";


        const realRoomId =
            room.id || roomId;


        // =================================
        // حفظها
        // =================================

        localStorage.setItem(
            "roomName",
            realRoomName
        );

        localStorage.setItem(
            "roomId",
            realRoomId
        );


        // =================================
        // عرض اسم الغرفة
        // =================================

        if (roomTitle) {

            roomTitle.textContent =
                "🎙️ " + realRoomName;

        }


        // =================================
        // عرض ID
        // =================================

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


                            if (data.type === "audio" && data.audioUrl) {

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
            style="width:100%; margin-top:10px;"
        ></audio>

    `;

} else {

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

                }
            );

        }


        // =====================================
        // إرسال الرسائل
        // =====================================

        if (sendBtn && input && messagesRef) {

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

    voiceBtn.addEventListener("click", async () => {

        // ===============================
        // بدء التسجيل
        // ===============================

        if (!isRecording) {

            try {

                const stream =
                    await navigator.mediaDevices.getUserMedia({
                        audio: true
                    });


                audioChunks = [];


                mediaRecorder =
                    new MediaRecorder(stream);


                mediaRecorder.addEventListener(
                    "dataavailable",
                    (event) => {

                        if (event.data.size > 0) {

                            audioChunks.push(
                                event.data
                            );

                        }

                    }
                );


             mediaRecorder.addEventListener(
    "stop",
    async () => {
        alert("🛑 STOP اشتغل");
        console.log("🎤 عدد أجزاء التسجيل:", audioChunks.length);

const audioBlob =  
                        new Blob(  
                            audioChunks,  
                            {  
                                type: "audio/webm"  
                            }  
                        );  


                    const audioUrl =  
                        URL.createObjectURL(  
                            audioBlob  
                        );  
        const fileName =
    `rooms/${realRoomId}/audio/${Date.now()}.webm`;

const audioRef =
    ref(storage, fileName);

await uploadBytes(
    audioRef,
    audioBlob,
    {
        contentType: "audio/webm"
    }
);

const firebaseAudioUrl =
    await getDownloadURL(audioRef);


                    const audio =  
                        document.createElement("audio");  


                    audio.controls = true;  

                    audio.src = audioUrl;  

                    audio.style.width = "100%";  

                    audio.style.marginTop = "10px";  


                    messagesBox.appendChild(  
                        audio  
                    );  

                try {

    await addDoc(
        messagesRef,
        {
            type: "audio",
            audioUrl: firebaseAudioUrl,
            user: localStorage.getItem("userName") || "مستخدم",
            photo: localStorage.getItem("userPhoto") || "default.png",
            time: serverTimestamp()
        }
    );

    console.log("✅ تم حفظ التسجيل في Firestore");

} catch (error) {

    console.error(
        "❌ خطأ في حفظ التسجيل:",
        error
    );

    alert(
        "❌ لم يتم حفظ التسجيل: " +
        error.message
    );

} 
       messagesBox.scrollTop =  
                        messagesBox.scrollHeight;  


                    stream  
                        .getTracks()  
                        .forEach(  
                            track => track.stop()  
                        );  

                }  
            );  


            mediaRecorder.start();  

            isRecording = true;  


            voiceBtn.textContent = "⏹️";  


        } catch (error) {  

            console.error(  
                "Recording error:",  
                error  
            );  


            alert(  
                isTurkish  
                    ? "❌ Mikrofon açılamadı."  
                    : "❌ لم يتم تشغيل الميكروفون."  
            );  

        }  

    }
        // ===============================
        // إيقاف التسجيل
        // ===============================

        else {

            if (
                mediaRecorder &&
                mediaRecorder.state !== "inactive"
            ) {

                mediaRecorder.stop();

            }


            isRecording = false;


            voiceBtn.textContent = "🎤";

        }

    });

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
