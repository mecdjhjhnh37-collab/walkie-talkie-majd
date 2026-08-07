import "./app.js";
import "./user.js";

document.addEventListener("DOMContentLoaded", () => {

    const joinRoomBtn = document.getElementById("joinRoomBtn");

    if (!joinRoomBtn) return;

    joinRoomBtn.addEventListener("click", openJoinRoom);


    function openJoinRoom() {

        const language =
            localStorage.getItem("language") || "ar";

        const isTurkish =
            language === "tr" ||
            language === "turkish";


        // إذا كانت النافذة موجودة، لا تنشئ واحدة ثانية
        const oldPopup =
            document.getElementById("joinRoomPopup");

        if (oldPopup) {
            oldPopup.remove();
        }


        const popup =
            document.createElement("div");

        popup.id = "joinRoomPopup";
        popup.className = "popup";

        popup.style.display = "flex";


        popup.innerHTML = `

            <div class="popup-box">

                <h2>
                    ${
                        isTurkish
                        ? "🚪 Odaya Katıl"
                        : "🚪 دخول إلى غرفة"
                    }
                </h2>


                <input
                    id="joinRoomId"
                    type="text"
                    placeholder="${
                        isTurkish
                        ? "Oda ID'sini gir"
                        : "أدخل ID الغرفة"
                    }"
                    autocomplete="off"
                >


                <div class="popup-buttons">

                    <button
                        type="button"
                        id="joinRoomNow">

                        ${
                            isTurkish
                            ? "🚪 Katıl"
                            : "🚪 دخول"
                        }

                    </button>


                    <button
                        type="button"
                        id="cancelJoinRoom">

                        ${
                            isTurkish
                            ? "❌ İptal"
                            : "❌ إلغاء"
                        }

                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(popup);


        const input =
            popup.querySelector("#joinRoomId");

        const joinBtn =
            popup.querySelector("#joinRoomNow");

        const cancelBtn =
            popup.querySelector("#cancelJoinRoom");


        // =========================
        // إلغاء
        // =========================

        cancelBtn.addEventListener("click", () => {

            popup.remove();

        });


        // =========================
        // دخول
        // =========================

        joinBtn.addEventListener("click", () => {

            const roomId =
                input.value.trim();


            if (!roomId) {

                alert(
                    isTurkish
                    ? "Lütfen oda ID'sini girin."
                    : "يرجى إدخال ID الغرفة."
                );

                input.focus();

                return;
            }


            console.log(
                "Joining room:",
                roomId
            );


            window.location.href =
                `/room/${encodeURIComponent(roomId)}`;

        });


        // =========================
        // زر Enter
        // =========================

        input.addEventListener("keydown", (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                joinBtn.click();

            }

        });


        input.focus();

    }

});
