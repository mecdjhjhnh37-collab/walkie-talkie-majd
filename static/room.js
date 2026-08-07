import { db } from "./app.js";

import {
    doc,
    runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // صفحة الغرفة
    // =========================

    const roomTitle = document.getElementById("roomName");
    const roomId = document.getElementById("roomId");

    const savedRoomName = localStorage.getItem("roomName");
    const savedRoomId = localStorage.getItem("roomId");

    if (roomTitle && savedRoomName) {
        roomTitle.textContent = "🎙️ " + savedRoomName;
    }

    if (roomId && savedRoomId) {
        roomId.textContent = "ID: " + savedRoomId;
    }

    // =========================
    // صفحة Home
    // =========================

    const popup = document.getElementById("roomPopup");
    const openBtn = document.getElementById("createRoomBtn");
    const cancelBtn = document.getElementById("cancelRoom");
    const createBtn = document.getElementById("createRoomNow");

    if (openBtn && popup) {

        openBtn.onclick = () => {

            popup.style.display = "flex";

        };

    }

    if (cancelBtn && popup) {

        createBtn.onclick = async () => {

    alert("تم الضغط على زر إنشاء");

    const roomName = document
        .getElementById("newRoomName")
        .value
        .trim();

            popup.style.display = "none";

        };

    }

    if (createBtn) {

        createBtn.onclick = async () => {

            const roomName = document
                .getElementById("newRoomName")
                .value
                .trim();

            if (roomName === "") {

                alert("اكتب اسم الغرفة");

                return;

            }

            try {

                const counterRef = doc(db, "counters", "rooms");

                const roomId = await runTransaction(db, async (transaction) => {

                    const counterDoc = await transaction.get(counterRef);

                    let lastNumber = 0;

                    if (counterDoc.exists()) {
                        lastNumber = counterDoc.data().lastNumber;
                    }

                    lastNumber++;

                    transaction.set(counterRef, {
                        lastNumber: lastNumber
                    }, { merge: true });

                    return "room-" + String(lastNumber).padStart(6, "0");

                });

                localStorage.setItem("roomName", roomName);
                localStorage.setItem("roomId", roomId);

                window.location.href = "/room";

            } catch (e) {

                console.error(e);
                alert("حدث خطأ أثناء إنشاء الغرفة");

            }

        };

    }

});
