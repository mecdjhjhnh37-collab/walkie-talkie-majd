import { db } from "./app.js";

import {
    doc,
    runTransaction,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {

    const popup = document.getElementById("roomPopup");
    const openBtn = document.getElementById("createRoomBtn");
    const cancelBtn = document.getElementById("cancelRoom");
    const createBtn = document.getElementById("createRoomNow");


    // =========================
    // فتح نافذة إنشاء الغرفة
    // =========================

    if (openBtn && popup) {

        openBtn.onclick = () => {

            popup.style.display = "flex";

        };

    }


    // =========================
    // إغلاق النافذة
    // =========================

    if (cancelBtn && popup) {

        cancelBtn.onclick = () => {

            popup.style.display = "none";

        };

    }


    // =========================
    // إنشاء الغرفة
    // =========================

    if (createBtn) {

        createBtn.onclick = async () => {

            const roomNameInput =
                document.getElementById("newRoomName");

            const roomPasswordInput =
                document.getElementById("roomPassword");


            const roomName =
                roomNameInput
                    ? roomNameInput.value.trim()
                    : "";


            const roomPassword =
                roomPasswordInput
                    ? roomPasswordInput.value
                    : "";


            if (roomName === "") {

                alert(
                    localStorage.getItem("language") === "tr"
                        ? "Oda adını yazın"
                        : "اكتب اسم الغرفة"
                );

                return;

            }


            // =========================
            // معلومات المستخدم
            // =========================

            const userName =
                localStorage.getItem("userName") ||
                "مستخدم";


            const userPhoto =
                localStorage.getItem("userPhoto") ||
                "default.png";


            // نستخدم UID الحقيقي إذا كان محفوظًا
            const userUid =
                localStorage.getItem("userUid") ||
                localStorage.getItem("uid") ||
                "unknown";


            try {

                // =========================
                // عداد الغرف
                // =========================

                const counterRef =
                    doc(db, "counters", "rooms");


                const roomNumber =
                    await runTransaction(
                        db,
                        async (transaction) => {

                            const counterDoc =
                                await transaction.get(
                                    counterRef
                                );


                            let lastNumber = 0;


                            if (counterDoc.exists()) {

                                lastNumber =
                                    counterDoc.data().lastNumber || 0;

                            }


                            lastNumber++;


                            transaction.set(
                                counterRef,
                                {
                                    lastNumber: lastNumber
                                },
                                {
                                    merge: true
                                }
                            );


                            return lastNumber;

                        }
                    );


                // =========================
                // ID الغرفة
                // =========================

                const roomId =
                    "MC-" +
                    String(roomNumber)
                        .padStart(6, "0");


                // =========================
                // نوع الغرفة
                // =========================

                const roomType =
                    document.querySelector(
                        'input[name="roomType"]:checked'
                    )?.value || "public";


                // =========================
                // عدد الأعضاء
                // =========================

                const membersLimit =
                    Number(
                        document.getElementById(
                            "roomMembers"
                        )?.value || 10
                    );


                // =========================
                // حفظ الغرفة
                // =========================

                await setDoc(
                    doc(db, "rooms", roomId),
                    {

                        id: roomId,

                        name: roomName,

                        password: roomPassword,

                        type: roomType,

                        membersLimit: membersLimit,

                        ownerUid: userUid,

                        ownerName: userName,

                        ownerPhoto: userPhoto,

                        createdAt: new Date(),

                        members: {}

                    }
                );


                // =========================
                // حفظ بيانات الغرفة محليًا
                // =========================

                localStorage.setItem(
                    "roomName",
                    roomName
                );


                localStorage.setItem(
                    "roomId",
                    roomId
                );


                // =========================
                // إغلاق النافذة
                // =========================

                if (popup) {

                    popup.style.display = "none";

                }


                // =========================
                // الدخول للغرفة
                // =========================

                window.location.href = "/room";


            } catch (error) {

                console.error(
                    "Create room error:",
                    error
                );


                alert(
                    localStorage.getItem("language") === "tr"
                        ? "Oda oluşturulamadı: " + error.message
                        : "لم يتم إنشاء الغرفة: " + error.message
                );

            }

        };

    }

});
