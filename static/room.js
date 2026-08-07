document.addEventListener("DOMContentLoaded", () => {

    // عرض بيانات الغرفة

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



    // زر الاتصال الصوتي

    const callBtn = document.getElementById("callBtn");

    if(callBtn){

        callBtn.onclick = () => {

            alert("زر الاتصال الصوتي يعمل 📞");

        };

    }



    // زر الفيديو

    const videoBtn = document.getElementById("videoBtn");

    if(videoBtn){

        videoBtn.onclick = () => {

            alert("زر الفيديو يعمل 📹");

        };

    }



    // زر إرسال الرسالة

    const sendBtn = document.getElementById("sendMessage");

    const input = document.getElementById("messageInput");

    const messages = document.getElementById("messages");


    if(sendBtn){

        sendBtn.onclick = () => {

            let text = input.value.trim();


            if(text === ""){
                return;
            }


            let p = document.createElement("p");

            p.textContent = text;


            messages.appendChild(p);


            input.value = "";


        };

    }



    // زر الصوت

    const voiceBtn = document.getElementById("voiceBtn");


    if(voiceBtn){

        voiceBtn.onclick = () => {

            alert("زر الصوت يعمل 🎤");

        };

    }



});
