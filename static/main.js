import "./app.js";
import "./user.js";

document.addEventListener("DOMContentLoaded", () => {

    const joinRoomBtn = document.getElementById("joinRoomBtn");

    if (!joinRoomBtn) return;


    joinRoomBtn.addEventListener("click", () => {

        // اللغة المختارة
        const language =
            localStorage.getItem("language") || "ar";


        // إنشاء النافذة
        const popup = document.createElement("div");

        popup.className = "popup";

        popup.style.display = "flex";


        // =========================
        // التركية
        // =========================

        if (
            language === "tr" ||
            language === "turkish"
        ) {

            popup.innerHTML = `

                <div class="popup-box">

                    <h2>
                        🚪 Odaya Katıl
                    </h2>


                    <input
                        id="joinRoomId"
                        type="text"
                        placeholder="Oda ID'sini gir"
                        autocomplete="off"
                    >


                    <div class="popup-buttons">

                        <button id="joinRoomNow">
                            🚪 Katıl
                        </button>


                        <button id="cancelJoinRoom">
                            ❌ İptal
                        </button>

                    </div>

                </div>

            `;

        }


        // =========================
        // العربية
        // =========================

        else {

            popup.innerHTML = `

                <div class="popup-box">

                    <h2>
                        🚪 دخول إلى غرفة
                    </h2>


                    <input
                        id="joinRoomId"
                        type="text"
                        placeholder="أدخل ID الغرفة"
                        autocomplete="off"
                    >


                    <div class="popup-buttons">

                        <button id="joinRoomNow">
                            🚪 دخول
                        </button>


                        <button id="cancelJoinRoom">
                            ❌ إلغاء
                        </button>

                    </div>

                </div>

            `;

        }


        document.body.appendChild(popup);


        // =========================
        // زر الإلغاء
        // =========================

        const cancelBtn =
            document.getElementById("cancelJoinRoom");


        cancelBtn.addEventListener("click", () => {

            popup.remove();

        });


        // =========================
        // زر الدخول
        // =========================

        const joinBtn =
            document.getElementById("joinRoomNow");


        joinBtn.addEventListener("click", () => {

            const roomId =
                document
                    .getElementById("joinRoomId")
                    .value
                    .trim();


            if (!roomId) {

                if (
                    language === "tr" ||
                    language === "turkish"
                ) {

                    alert("Lütfen oda ID'sini girin.");

                } else {

                    alert("يرجى إدخال ID الغرفة.");

                }

                return;
            }


            // الانتقال إلى الغرفة
            window.location.href =
                `/room/${encodeURIComponent(roomId)}`;

        });

    });

});
