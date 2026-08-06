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
  appId: "1:595103941809:web:08af004c43bc94ec33ce90"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();


window.addEventListener("DOMContentLoaded", () => {


  const googleLogin = document.getElementById("googleLogin");


  if (!googleLogin) {

    console.log("لم يتم العثور على googleLogin");

    return;

  }


  googleLogin.innerHTML = `

    <button id="loginBtn" type="button">
      🔵 تسجيل الدخول بواسطة Google
    </button>

  `;



  const loginBtn = document.getElementById("loginBtn");


  loginBtn.addEventListener("click", async () => {


    console.log("تم الضغط على الزر");


    try {


      const result = await signInWithPopup(
        auth,
        provider
      );


      const user = result.user;


      alert(
        "مرحباً " + user.displayName
      );


      console.log(user);


    } catch(error) {


      console.error(error);


      alert(
        "خطأ: " + error.message
      );


    }


  });


});
