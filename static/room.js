import { db } from "./app.js";

import {
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    orderBy,
    query,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", async () => {

    // =====================================
    // اللغة
    // =====================================

    const language =
        localStorage.getItem("language") || "ar";

    const isTurkish =
        language === "tr" ||
        language === "turkish";


    // =====================================
    // الحصول على Room ID من الرابط
    // =====================================

    const pathParts =
        window.location.pathname.split("/");

    const urlRoomId =
        decodeURIComponent(
            pathParts[pathParts.length - 1]
        );


    let roomId =
        urlRoomId ||
        localStorage.getItem("roomId");


    // =====================================
    // عناصر الصفحة
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


    // =====================================
    // إذا لم يوجد Room ID
    // =====================================

    if (!roomId || roomId === "room.html") {

        if (roomTitle) {

            roomTitle.textContent =
                isTurkish
                    ? "🎙️ Oda bulunamadı"
                    : "🎙️ لم يتم العثور على الغرفة";

        }

        return;
    }


    // =====================================
    // حفظ Room ID
    // =====================================

    localStorage.setItem(
        "roomId",
        roomId
    );


    // =====================================
    // عرض Room ID
    // =====================================

    if (roomIdText) {

        roomIdText.textContent =
            "ID: " + roomId;

    }


    // =====================================
    // جلب معلومات الغرفة من Firestore
    // =====================================

    let realRoomName =
        localStorage.getItem("roomName");


    try {

        const roomRef =
            doc(
                db,
                "rooms",
                roomId
            );


        const roomSnapshot =
            await getDoc(roomRef);


        if (roomSnapshot.exists()) {

            const roomData =
                roomSnapshot.data();


            // جرّب أكثر من اسم للحقل
            realRoomName =
                roomData.name ||
                roomData.roomName ||
                roomData.title ||
                realRoomName ||
                (isTurkish
                    ? "İsimsiz Oda"
                    : "غرفة بدون اسم");


            // حفظ الاسم
            localStorage.setItem(
                "roomName",
                realRoomName
            );

        }

    } catch (error) {

        console.error(
            "Room information error:",
            error
        );

    }


    // =====================================
    // عرض اسم الغرفة
    // =====================================

    if (roomTitle) {

        roomTitle.textContent =
            "🎙️ " + (
                realRoomName ||
                (
                    isTurkish
                        ? "Oda"
                        : "الغرفة"
                )
            );

    }


    // =====================================
    // Placeholder الرسائل
    // =====================================

    if (input) {

        input.placeholder =
            isTurkish
                ? "Mesaj yaz..."
                : "اكتب رسالة...";

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
                roomId,
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


                        const photo =
                            data.photo ||
                            "https://i.imgur.com/6VBx3io.png";


                        const user =
                            data.user ||
                            (
                                isTurkish
                                    ? "Kullanıcı"
                                    : "مستخدم"
                            );


                        const text =
                            data.text || "";


                        messageDiv.innerHTML = `

                            <div class="message-head">

                                <img
                                    src="${photo}"
                                    class="message-photo"
                                >

                                <span class="message-user">
                                    ${user}
                                </span>

                            </div>

                            <div class="message-text">
                                ${text}
                            </div>

                        `;


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
    // إرسال رسالة
    // =====================================

    if (sendBtn && input && messagesRef) {

        sendBtn.addEventListener(
            "click",
            async () => {

                const text =
                    input.value.trim();


                if (!text) return;


                const userName =
                    localStorage.getItem("userName") ||
                    (
                        isTurkish
                            ? "Kullanıcı"
                            : "مستخدم"
                    );


                const userPhoto =
                    localStorage.getItem("userPhoto") ||
                    "https://i.imgur.com/6VBx3io.png";


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

                    console.error(error);


                    alert(
                        isTurkish
                            ? "Mesaj gönderilemedi."
                            : "حدث خطأ أثناء إرسال الرسالة."
                    );

                }

            }
        );


        // Enter = إرسال
        input.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    sendBtn.click();

                }

            }
        );

    }


    // =====================================
    // زر الاتصال
    // =====================================

    const callBtn =
        document.getElementById("callBtn");


    if (callBtn) {

        callBtn.addEventListener(
            "click",
            () => {

                alert(
                    isTurkish
                        ? "📞 Arama özelliği yakında."
                        : "📞 الاتصال قيد التطوير."
                );

            }
        );

    }


    // =====================================
    // زر الفيديو
    // =====================================

    const videoBtn =
        document.getElementById("videoBtn");


    if (videoBtn) {

        videoBtn.addEventListener(
            "click",
            () => {

                alert(
                    isTurkish
                        ? "📹 Görüntülü arama yakında."
                        : "📹 الفيديو قيد التطوير."
                );

            }
        );

    }


    // =====================================
    // زر الميكروفون
    // =====================================

    const voiceBtn =
        document.getElementById("voiceBtn");


    if (voiceBtn) {

        voiceBtn.addEventListener(
            "click",
            () => {

                alert(
                    isTurkish
                        ? "🎤 Ses özelliği yakında."
                        : "🎤 الصوت قيد التطوير."
                );

            }
        );

    }

});
