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

    console.log("create-room.js loaded");


    // فتح نافذة إنشاء الغرفة
    if (openBtn && popup) {

        openBtn.addEventListener("click", () => {

            console.log("Create room button clicked");

            popup.style.display = "flex";

        });

    }


    // إلغاء
    if (cancelBtn && popup) {

        cancelBtn.addEventListener("click", () => {

            popup.style.display = "none";

        });

    }


    // إنشاء الغرفة
    if (createBtn) {

        createBtn.addEventListener("click", async () => {

            console.log("Oda oluştur clicked");


            const language =
                localStorage.getItem("language") || "ar";


            const nameInput =
                document.getElementById("newRoomName");


            const passwordInput =
                document.getElementById("roomPassword");


            const roomName =
                nameInput?.value.trim() || "";


            const password =
                passwordInput?.value || "";


            if (!roomName) {

                alert(
                    language === "tr"
                        ? "Oda adını yazın."
                        : "اكتب اسم الغرفة."
                );

                return;

            }


            try {

                // رقم الغرفة
                const counterRef =
                    doc(db, "counters", "rooms");


                const roomNumber =
                    await runTransaction(
                        db,
                        async (transaction) => {

                            const counter =
                                await transaction.get(
                                    counterRef
                                );


                            let number = 0;


                            if (counter.exists()) {

                                number =
                                    counter.data().lastNumber || 0;

                            }


                            number++;


                            transaction.set(
                                counterRef,
                                {
                                    lastNumber: number
                                },
                                {
                                    merge: true
                                }
                            );


                            return number;

                        }
                    );


                // ID الغرفة
                const roomId =
                    "MC-" +
                    String(roomNumber).padStart(6, "0");


                const roomType =
                    document.querySelector(
                        'input[name="roomType"]:checked'
                    )?.value || "public";


                const membersLimit =
                    Number(
                        document.getElementById("roomMembers")?.value || 10
                    );


                const userUid =
                    localStorage.getItem("userUid") || "unknown";


                const userName =
                    localStorage.getItem("userName") || "مستخدم";


                const userPhoto =
                    localStorage.getItem("userPhoto") ||
                    "https://i.imgur.com/6VBx3io.png";


                // حفظ الغرفة
                await setDoc(
                    doc(db, "rooms", roomId),
                    {

                        id: roomId,

                        name: roomName,

                        password: password,

                        type: roomType,

                        membersLimit: membersLimit,

                        ownerUid: userUid,

                        ownerName: userName,

                        ownerPhoto: userPhoto,

                        createdAt: new Date(),

                        members: {}

                    }
                );


                // حفظ معلومات الغرفة
                localStorage.setItem(
                    "roomId",
                    roomId
                );


                localStorage.setItem(
                    "roomName",
                    roomName
                );


                // الدخول للغرفة
                window.location.href =
                    "/room?roomId=" +
                    encodeURIComponent(roomId);

            }


            catch (error) {

                console.error(
                    "CREATE ROOM ERROR:",
                    error
                );


                alert(
                    language === "tr"
                        ? "Oda oluşturulamadı: " + error.message
                        : "لم يتم إنشاء الغرفة: " + error.message
                );

            }

        });

    }

});
