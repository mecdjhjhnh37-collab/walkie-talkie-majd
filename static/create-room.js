import { db, app } from "./app.js";

import {
    doc,
    runTransaction,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const auth = getAuth(app);


document.addEventListener("DOMContentLoaded", () => {

    const popup = document.getElementById("roomPopup");
    const openBtn = document.getElementById("createRoomBtn");
    const cancelBtn = document.getElementById("cancelRoom");
    const createBtn = document.getElementById("createRoomNow");


    // فتح نافذة إنشاء الغرفة
    if (openBtn && popup) {

        openBtn.onclick = () => {
            popup.style.display = "flex";
        };

    }


    // إلغاء
    if (cancelBtn && popup) {

        cancelBtn.onclick = () => {
            popup.style.display = "none";
        };

    }


    // إنشاء الغرفة
    if (createBtn) {

        createBtn.onclick = async () => {

            const roomNameInput =
                document.getElementById("newRoomName");

            const roomName =
                roomNameInput ? roomNameInput.value.trim() : "";


            if (roomName === "") {

                alert(
                    localStorage.getItem("language") === "tr"
                        ? "Oda adını yazın"
                        : "اكتب اسم الغرفة"
                );

                return;
            }


            // التأكد من تسجيل الدخول
            const user = auth.currentUser;

            if (!user) {

                alert(
                    localStorage.getItem("language") === "tr"
                        ? "Önce Google ile giriş yapın"
                        : "يجب تسجيل الدخول أولاً"
                );

                window.location.href = "/login/ar";

                return;
            }


            const userName =
                localStorage.getItem("userName") ||
                user.displayName ||
                "مستخدم";


            const userPhoto =
                localStorage.getItem("userPhoto") ||
                user.photoURL ||
                "default.png";


            const userUid = user.uid;


            try {

                // عداد الغرف
                const counterRef =
                    doc(db, "counters", "rooms");


                const roomId =
                    await runTransaction(
                        db,
                        async (transaction) => {

                            const counterDoc =
                                await transaction.get(counterRef);


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


                            return (
                                "room-" +
                                String(lastNumber).padStart(6, "0")
                            );

                        }
                    );


                // حفظ الغرفة
                await setDoc(
                    doc(db, "rooms", roomId),
                    {

                        name: roomName,

                        ownerUid: userUid,

                        ownerName: userName,

                        ownerPhoto: userPhoto,

                        createdAt: new Date(),

                        members: {}

                    }
                );


                // حفظ محليًا
                localStorage.setItem(
                    "roomName",
                    roomName
                );


                localStorage.setItem(
                    "roomId",
                    roomId
                );


                // الدخول للغرفة
                window.location.href = "/room";


            } catch (e) {

                console.error(e);

                alert(e.message);

            }

        };

    }

});
