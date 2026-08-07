const translations = {

    ar: {
        friends: "الأصدقاء",
        createRoom: "إنشاء غرفة",
        joinRoom: "دخول إلى غرفة",
        publicRooms: "الغرف العامة",
        settings: "الإعدادات"
    },

    tr: {
        friends: "Arkadaşlar",
        createRoom: "Oda Oluştur",
        joinRoom: "Odaya Katıl",
        publicRooms: "Genel Odalar",
        settings: "Ayarlar"
    }

};

translations.ar.room = {
    title: "إنشاء غرفة",
    roomName: "اسم الغرفة",
    password: "كلمة المرور",
    public: "عامة",
    private: "خاصة",
    members: "عدد الأشخاص",
    create: "إنشاء",
    cancel: "إلغاء"
};

translations.tr.room = {
    title: "Oda Oluştur",
    roomName: "Oda Adı",
    password: "Şifre",
    public: "Genel",
    private: "Özel",
    members: "Kişi Sayısı",
    create: "Oluştur",
    cancel: "İptal"
};

function setLanguage(lang){

    localStorage.setItem("language", lang);

}

function loadLanguage(){

    const lang = localStorage.getItem("language") || "ar";

    const elements = {

        friendsText: "friends",
        createRoomText: "createRoom",
        joinRoomText: "joinRoom",
        publicRoomsText: "publicRooms",
        settingsText: "settings"

    };

    for (let id in elements){

        const element = document.getElementById(id);

        if(element){

            element.textContent =
            translations[lang][elements[id]];

        }

    }

    const room = translations[lang].room;

    if(room){

        document.getElementById("roomPopupTitle").textContent = room.title;

        document.getElementById("roomName").placeholder = room.roomName;

        document.getElementById("roomPassword").placeholder = room.password;

        document.getElementById("publicRoomText").textContent = room.public;

        document.getElementById("privateRoomText").textContent = room.private;

        document.getElementById("membersText").textContent = room.members;

        document.getElementById("createRoomNow").textContent = room.create;

        document.getElementById("cancelRoom").textContent = room.cancel;

    }

}

document.addEventListener(
    "DOMContentLoaded",
    loadLanguage
);

window.translations = translations;
