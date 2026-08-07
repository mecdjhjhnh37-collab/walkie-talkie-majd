import { db } from "./app.js";

import {
    collection,
    addDoc,
    onSnapshot,
    serverTimestamp,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {


    // =========================
    // معلومات الغرفة
    // =========================

    const roomTitle = document.getElementById("roomName");
    const roomIdText = document.getElementById("roomId");


    const savedRoomName = localStorage.getItem("roomName");
    const savedRoomId = localStorage.getItem("roomId");


    if(roomTitle && savedRoomName){

        roomTitle.textContent = "🎙️ " + savedRoomName;

    }


    if(roomIdText && savedRoomId){

        roomIdText.textContent = "ID: " + savedRoomId;

    }



    // =========================
    // الشات Firebase
    // =========================


    const messagesBox = document.getElementById("messages");
    const input = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendMessage");


    const roomId = savedRoomId;



    if(messagesBox && roomId){


        const messagesRef = collection(
            db,
            "rooms",
            roomId,
            "messages"
        );


        const q = query(
            messagesRef,
            orderBy("time")
        );



        onSnapshot(q,(snapshot)=>{


            messagesBox.innerHTML="";


            snapshot.forEach((doc)=>{


                const data = doc.data();


                const messageDiv = document.createElement("div");

messageDiv.className = "message";


messageDiv.innerHTML = `

<div class="message-user">
👤 ${data.user}
</div>

<div class="message-text">
${data.text}
</div>

`;


messagesBox.appendChild(messageDiv);


            });


        });


    }




    // إرسال رسالة


    if(sendBtn){


        sendBtn.onclick = async()=>{


            const text = input.value.trim();



            if(text === ""){

                return;

            }



            await addDoc(

                collection(
                    db,
                    "rooms",
                    roomId,
                    "messages"
                ),

                {

                    text:text,

                    user:"مستخدم",

                    time:serverTimestamp()

                }

            );



            input.value="";



        };


    }





    // =========================
    // أزرار الاتصال (تجربة)
    // =========================


    const callBtn =
    document.getElementById("callBtn");


    if(callBtn){

        callBtn.onclick=()=>{

            alert("📞 الاتصال الصوتي قيد التطوير");

        };

    }



    const videoBtn =
    document.getElementById("videoBtn");


    if(videoBtn){

        videoBtn.onclick=()=>{

            alert("📹 الفيديو قيد التطوير");

        };

    }



    const voiceBtn =
    document.getElementById("voiceBtn");


    if(voiceBtn){

        voiceBtn.onclick=()=>{

            alert("🎤 تسجيل الصوت قيد التطوير");

        };

    }



});
