const translations = {

    ar: {
        friends: "👥 الأصدقاء",
        createRoom: "🎙️ إنشاء غرفة",
        joinRoom: "🚪 دخول إلى غرفة",
        publicRooms: "🌍 الغرف العامة",
        settings: "⚙️ الإعدادات"
    },


    tr: {
        friends: "👥 Arkadaşlar",
        createRoom: "🎙️ Oda Oluştur",
        joinRoom: "🚪 Odaya Katıl",
        publicRooms: "🌍 Genel Odalar",
        settings: "⚙️ Ayarlar"
    }

};
function loadLanguage(){

    let lang = localStorage.getItem("language") || "ar";

    document.getElementById("friendsText").textContent =
    translations[lang].friends.replace("👥 ","");

    document.getElementById("createRoomText").textContent =
    translations[lang].createRoom.replace("🎙️ ","");

    document.getElementById("joinRoomText").textContent =
    translations[lang].joinRoom.replace("🚪 ","");

    document.getElementById("publicRoomsText").textContent =
    translations[lang].publicRooms.replace("🌍 ","");

    document.getElementById("settingsText").textContent =
    translations[lang].settings.replace("⚙️ ","");

}


document.addEventListener("DOMContentLoaded", loadLanguage);
