const translations = {

    ar: {
        friends: "الأصدقاء",
        createRoom: "إنشاء غرفة",
        joinRoom: "دخول إلى غرفة",
        publicRooms: "الغرف العامة",
        settings: "الإعدادات",

        room: {
            title: "إنشاء غرفة",
            roomName: "اسم الغرفة",
            password: "كلمة المرور",
            public: "عامة",
            private: "خاصة",
            members: "عدد الأشخاص",
            create: "إنشاء",
            cancel: "إلغاء"
        }
    },

    tr: {
        friends: "Arkadaşlar",
        createRoom: "Oda Oluştur",
        joinRoom: "Odaya Katıl",
        publicRooms: "Genel Odalar",
        settings: "Ayarlar",

        room: {
            title: "Oda Oluştur",
            roomName: "Oda Adı",
            password: "Şifre",
            public: "Genel",
            private: "Özel",
            members: "Kişi Sayısı",
            create: "Oluştur",
            cancel: "İptal"
        }
    }

};


function setLanguage(lang) {

    if (lang !== "ar" && lang !== "tr") {
        lang = "ar";
    }

    localStorage.setItem("language", lang);

    applyLanguage(lang);
}


function applyLanguage(lang) {

    const text = translations[lang];

    document.documentElement.lang = lang;
    document.documentElement.dir =
        lang === "tr" ? "ltr" : "rtl";


    const elements = {

        friendsText: text.friends,
        createRoomText: text.createRoom,
        joinRoomText: text.joinRoom,
        publicRoomsText: text.publicRooms,
        settingsText: text.settings

    };


    for (const id in elements) {

        const element =
            document.getElementById(id);

        if (element) {

            element.textContent =
                elements[id];

        }
    }


    // نافذة إنشاء الغرفة

    const room = text.room;


    const roomPopupTitle =
        document.getElementById("roomPopupTitle");

    if (roomPopupTitle) {
        roomPopupTitle.textContent =
            room.title;
    }


    const newRoomName =
        document.getElementById("newRoomName");

    if (newRoomName) {
        newRoomName.placeholder =
            room.roomName;
    }


    const roomPassword =
        document.getElementById("roomPassword");

    if (roomPassword) {
        roomPassword.placeholder =
            room.password;
    }


    const publicRoomText =
        document.getElementById("publicRoomText");

    if (publicRoomText) {
        publicRoomText.textContent =
            room.public;
    }


    const privateRoomText =
        document.getElementById("privateRoomText");

    if (privateRoomText) {
        privateRoomText.textContent =
            room.private;
    }


    const membersText =
        document.getElementById("membersText");

    if (membersText) {
        membersText.textContent =
            room.members;
    }


    const createRoomNow =
        document.getElementById("createRoomNow");

    if (createRoomNow) {
        createRoomNow.textContent =
            room.create;
    }


    const cancelRoom =
        document.getElementById("cancelRoom");

    if (cancelRoom) {
        cancelRoom.textContent =
            room.cancel;
    }


    // اللغة داخل الغرفة

    const messageInput =
        document.getElementById("messageInput");

    if (messageInput) {

        messageInput.placeholder =
            lang === "tr"
                ? "Mesaj yaz..."
                : "اكتب رسالة...";
    }
}


function loadLanguage() {

    const savedLanguage =
        localStorage.getItem("language") || "ar";

    applyLanguage(savedLanguage);
}


document.addEventListener(
    "DOMContentLoaded",
    loadLanguage
);


window.translations = translations;
window.setLanguage = setLanguage;
window.loadLanguage = loadLanguage;
