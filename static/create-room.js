import { db } from "./app.js";

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

    // =========================
    // اللغة
    // =========================

    const language =
        localStorage.getItem("language") || "ar";


    // =========================
    // عناصر الصفحة
    // =========================

    const roomTitle =
        document.getElementById("roomName");

    const roomIdText =
        document.getElementById("roomId");

    const input =
        document.getElementById("messageInput");

    const messagesBox =
        document.getElementById("messages");

    const sendBtn =
        document.getElementById("sendMessage");


    // =========================
    // الحصول على ID الغرفة من الرابط
    // =========================

    const params =
        new URLSearchParams(window.location.search);

    const urlRoomId =
        params.get("roomId");


    // إذا لم يوجد ID في الرابط
    if (!urlRoomId) {

        if (roomTitle) {

            roomTitle.textContent =
                language === "tr"
                    ? "Oda bulunamadı"
                    : "لم يتم العثور على الغرفة";

        }

        if (roomIdText) {

            roomIdText.textContent =
                language === "tr"
                    ? "Oda ID'si yok"
                    : "لا يوجد ID للغرفة";

        }

        return;

    }


    const roomId =
        urlRoomId.trim();


    // =========================
    // جلب بيانات الغرفة من Firebase
    // =========================

    try {

        const roomRef =
            doc(db, "rooms", roomId);

        const roomDoc =
            await getDoc(roomRef);


        if (!roomDoc.exists()) {

            if (roomTitle) {

                roomTitle.textContent =
                    language === "tr"
                        ? "Oda bulunamadı"
                        : "الغرفة غير موجودة";

            }

            if (roomIdText) {

                roomIdText.textContent =
                    "ID: " + roomId;

            }

            return;

        }


        const room =
            roomDoc.data();


        // =========================
        // اسم الغرفة الحقيقي
        // =========================

        const realRoomName =
            room.name ||
            (language === "tr"
                ? "İsimsiz oda"
                : "غرفة بدون اسم");


        // =========================
        // عرض اسم الغرفة
        // =========================

        if (roomTitle) {

            roomTitle.textContent =
                "🎙️ " + realRoomName;

        }


        // =========================
        // عرض ID الحقيقي
        // =========================

        if (roomIdText) {

            roomIdText.textContent =
                "ID: " + roomId;

        }


        // =========================
        // حفظ البيانات محليًا
        // =========================

        localStorage.setItem(
            "roomId",
            roomId
        );


        localStorage.setItem(
            "roomName",
            realRoomName
        );


        // =========================
        // Placeholder
        // =========================

        if (input) {

            input.placeholder =
                language === "tr"
                    ? "Mesaj yaz..."
                    : "اكتب رسالة...";

        }


        // =========================
        // الرسائل
        // =========================

        let messagesRef =
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

                if (!messagesBox) return;


                messagesBox.innerHTML = "";


                snapshot.forEach(
                    (messageDoc) => {

                        const data =
                            messageDoc.data();


                        const messageDiv =
                            document.createElement("div");


                        messageDiv.className =
                            "message";


                        const head =
                            document.createElement("div");

                        head.className =
                            "message-head";


                        const photo =
                            document.createElement("img");

                        photo.className =
                            "message-photo";

                        photo.src =
                            data.photo ||
                            "https://i.imgur.com/6VBx3io.png";


                        const user =
                            document.createElement("span");

                        user.className =
                            "message-user";

                        user.textContent =
                            data.user ||
                            (language === "tr"
                                ? "Kullanıcı"
                                : "مستخدم");


                        head.appendChild(photo);

                        head.appendChild(user);


                        const text =
                            document.createElement("div");

                        text.className =
                            "message-text";

                        text.textContent =
                            data.text || "";


                        messageDiv.appendChild(head);

                        messageDiv.appendChild(text);


                        messagesBox.appendChild(
                            messageDiv
                        );

                    }
                );


                messagesBox.scrollTop =
                    messagesBox.scrollHeight;

            }
        );


        // =========================
        // إرسال رسالة
        // =========================

        if (sendBtn && input) {

            sendBtn.onclick =
                async () => {

                    const text =
                        input.value.trim();


                    if (!text) return;


                    const userName =
                        localStorage.getItem(
                            "userName"
                        ) ||
                        (language === "tr"
                            ? "Kullanıcı"
                            : "مستخدم");


                    const userPhoto =
                        localStorage.getItem(
                            "userPhoto"
                        ) ||
                        "https://i.imgur.com/6VBx3io.png";


                    try {

                        await addDoc(
                            messagesRef,
                            {

                                text: text,

                                user: userName,

                                photo: userPhoto,

                                time:
                                    serverTimestamp()

                            }
                        );


                        input.value = "";


                    } catch (error) {

                        console.error(
                            "Message error:",
                            error
                        );


                        alert(
                            language === "tr"
                                ? "Mesaj gönderilemedi."
                                : "تعذر إرسال الرسالة."
                        );

                    }

                };


            // Enter للإرسال
            input.addEventListener(
                "keydown",
                (event) => {

                    if (
                        event.key === "Enter"
                    ) {

                        sendBtn.click();

                    }

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
                language === "tr"
                    ? "Oda yüklenemedi"
                    : "تعذر تحميل الغرفة";

        }

    }


});
