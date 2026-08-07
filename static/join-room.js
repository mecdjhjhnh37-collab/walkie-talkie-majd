document.addEventListener("DOMContentLoaded", () => {

    const joinRoomBtn = document.getElementById("joinRoomBtn");

    if (!joinRoomBtn) return;

    joinRoomBtn.addEventListener("click", () => {

        const language =
            localStorage.getItem("language") || "ar";

        const isTurkish =
            language === "tr" ||
            language === "turkish";

        const popup = document.createElement("div");

        popup.className = "popup";
        popup.style.display = "flex";

        popup.innerHTML = `

            <div class="popup-box">

                <h2>
                    ${isTurkish
                        ? "🚪 Odaya Katıl"
                        : "🚪 دخول إلى غرفة"}
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

                    <button id="joinRoomConfirm">
                        ${
                            isTurkish
                                ? "🚪 Katıl"
                                : "🚪 دخول"
                        }
                    </button>

                    <button id="joinRoomCancel">
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

        const confirm =
            popup.querySelector("#joinRoomConfirm");

        const cancel =
            popup.querySelector("#joinRoomCancel");


        cancel.addEventListener("click", () => {
            popup.remove();
        });


        confirm.addEventListener("click", () => {

            const roomId =
                input.value.trim();

            if (!roomId) {

                alert(
                    isTurkish
                        ? "Lütfen oda ID'sini gir."
                        : "يرجى إدخال ID الغرفة."
                );

                return;
            }

            window.location.href =
    "/room?roomId=" + encodeURIComponent(roomId);

        });


        input.addEventListener("keydown", (event) => {

            if (event.key === "Enter") {
                confirm.click();
            }

        });


        setTimeout(() => {
            input.focus();
        }, 100);

    });

});
