import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBrxgm0VQTfRv0ixXh9uQ81HBJ8SmD8c1E",
  authDomain: "mecd-voice-ap.firebaseapp.com",
  projectId: "mecd-voice-ap",
  storageBucket: "mecd-voice-ap.firebasestorage.app",
  messagingSenderId: "595103941809",
  appId: "1:595103941809:web:e50577f156bcea3633ce90"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

window.addEventListener("DOMContentLoaded", () => {

    const loginBtn = document.getElementById("loginBtn");

    if (!loginBtn) {
        return;
    }

    loginBtn.addEventListener("click", async () => {

        try {

            const result = await signInWithPopup(auth, provider);

            const user = result.user;

            alert("مرحباً " + user.displayName);

            window.location.href = "/home";

        } catch (error) {

            console.error(error);

            alert("خطأ:\n" + error.message);

        }

    });

});
// نظام تغيير لغة صفحة Home

const currentLanguage = localStorage.getItem("language") || "ar";


document.querySelectorAll("[data-key]").forEach((element) => {

    const key = element.getAttribute("data-key");

    if (translations[currentLanguage][key]) {

        element.innerHTML = translations[currentLanguage][key];

    }

});
let lang = localStorage.getItem("language") || "ar";

<div class="menu">

<button>
👥 <span id="friendsText">الأصدقاء</span>
</button>

<button>
🎙️ <span id="createRoomText">إنشاء غرفة</span>
</button>

<button>
🚪 <span id="joinRoomText">دخول إلى غرفة</span>
</button>

<button>
🌍 <span id="publicRoomsText">الغرف العامة</span>
</button>

<button>
⚙️ <span id="settingsText">الإعدادات</span>
</button>

</div>
