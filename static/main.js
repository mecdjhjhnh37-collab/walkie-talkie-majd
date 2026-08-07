import "./app.js";
import "./user.js";
import "./create-room.js";

document.addEventListener("DOMContentLoaded", () => {
    if (typeof loadLanguage === "function") {
        loadLanguage();
    }
});
