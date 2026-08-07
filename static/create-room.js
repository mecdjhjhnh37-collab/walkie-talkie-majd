import { db } from "./app.js";

import {
    doc,
    runTransaction,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {

    const popup =
        document.getElementById("roomPopup");

    const openBtn =
        document.getElementById("createRoomBtn");

    const cancelBtn =
        document.getElementById("cancelRoom");

    const createBtn =
        document.getElementById("createRoomNow");


    // ========================================
    // فتح نافذة إنشاء الغرفة
    // ========================================

    if (openBtn && popup) {

        openBtn.onclick = () => {

            popup.style.display = "flex";

        };

    }


    // ========================================
    // إلغاء
    // ========================================

    if (cancelBtn && popup) {

        cancelBtn.onclick = () => {

            popup.style.display = "none";

        };

    }


    // ========================================
    // إنشاء الغرفة
    // ========================================

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


            // التأكد من اسم الغرفة

            if (roomName === "") {

                alert("اكتب اسم الغرفة");

                return;

            }


            // ========================================
            // معلومات المستخدم
            // ========================================

            const userName =
                localStorage.getItem("userName") ||
                "مستخدم";


            const userPhoto =
                localStorage.getItem("userPhoto") ||
                "default.png";


            const userUid =
                localStorage.getItem("userUid") ||
                "unknown";


            // نوع الغرفة

            const roomTypeElement =
                document.querySelector(
                    'input[name="roomType"]:checked'
                );


            const roomType =
                roomTypeElement
                    ? roomTypeElement.value
                    : "public";


            // عدد الأعضاء

            const membersElement =
                document.getElementById("roomMembers");


            const maxMembers =
                membersElement
                    ? Number(membersElement.value)
                    : 10;


            try {

                // ========================================
                // عداد الغرف
                // ========================================

                const counterRef =
                    doc(
                        db,
                        "counters",
                        "rooms"
                    );


                const roomId =
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
                                    counterDoc.data()
                                        .lastNumber || 0;

                            }


                            // زيادة رقم الغرفة

                            lastNumber++;


                            // حفظ العداد

                            transaction.set(
                                counterRef,
                                {
                                    lastNumber:
                                        lastNumber
                                },
                                {
                                    merge: true
                                }
                            );


                            // ID الغرفة

                            return (
                                "MC-" +
                                String(lastNumber)
                                    .padStart(6, "0")
                            );

                        }
                    );


                // ========================================
                // حفظ الغرفة في Firestore
                // ========================================

                await setDoc(
                    doc(
                        db,
                        "rooms",
                        roomId
                    ),
                    {

                        id: roomId,

                        name: roomName,

                        type: roomType,

                        password:
                            roomType === "private"
                                ? roomPassword
                                : "",

                        maxMembers:
                            maxMembers,

                        ownerUid:
                            userUid,

                        ownerName:
                            userName,

                        ownerPhoto:
                            userPhoto,

                        createdAt:
                            new Date(),

                        members: {}

                    }
                );


                // ========================================
                // حفظ معلومات الغرفة محليًا
                // ========================================

                localStorage.setItem(
                    "roomName",
                    roomName
                );


                localStorage.setItem(
                    "roomId",
                    roomId
                );


                // ========================================
                // الدخول إلى الغرفة
                // ========================================

                window.location.href =
                    "/room";


            } catch (error) {

                console.error(
                    "Create room error:",
                    error
                );


                alert(
                    "حدث خطأ أثناء إنشاء الغرفة:\n" +
                    error.message
                );

            }

        };

    }

});
