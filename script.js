// ==========================================
// AMETHYST DINING - CENTRAL BACKEND SYSTEM
// DEVELOPED FOR: MAKBEL ASCHALEW
// ==========================================

// ⚠️ የራስዎን የGoogle Sheet ID እዚህ ይተኩ (ከሊንኩ መሃል ላይ የሚገኘውን ረጅሙን ኮድ)
var SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE"; 
var TELEGRAM_TOKEN = "8979621552:AAESTA_S1M-iZ0Vq_zXyTZkptRaeHAAD698";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // 1. መረጃው የመጣው ከቴሌግራም ቦት ከሆነ
    if (data.message) {
      handleTelegramMessage(data, sheet);
    } 
    // 2. መረጃው የመጣው ከዌብሳይቱ ከሆነ
    else if (data.action === "log_web_order") {
      logWebOrder(data, sheet);
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: err.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

// ከዌብሳይት የሚመጣውን ትዕዛዝ በ Google Sheet ላይ መመዝገቢያ
function logWebOrder(data, sheet) {
  sheet.appendRow([
    new Date(),
    data.source, // Web-WhatsApp, Web-Telegram, Web-SMS
    data.foodName,
    data.quantity,
    data.totalPrice + " ETB",
    data.note || "-",
    "-"
  ]);
}

// ከቴሌግራም ቦት የሚመጣውን ትዕዛዝ መለይቶ በ Google Sheet ላይ መመዝገቢያ
function handleTelegramMessage(data, sheet) {
  var chatId = data.message.chat.id;
  var text = data.message.text;
  var user = data.message.chat.username ? "@" + data.message.chat.username : (data.message.chat.first_name || "Unknown");
  
  if (text && text.includes("አዲስ ትዕዛዝ ማቅረብ እፈልጋለሁ")) {
    var foodName = "Not parsed";
    var qty = "1";
    var totalPrice = "0";
    var note = "-";
    
    var foodMatch = text.match(/የምግብ ስም:\s*(.*)/);
    var qtyMatch = text.match(/የምግብ ብዛት:\s*(\d+)/);
    var priceMatch = text.match(/ጠቅላላ ዋጋ:\s*(.*)/);
    var noteMatch = text.match(/ልዩ ፍላጎት:\s*(.*)/);
    
    if (foodMatch) foodName = foodMatch[1].trim();
    if (qtyMatch) qty = qtyMatch[1].trim();
    if (priceMatch) totalPrice = priceMatch[1].trim();
    if (noteMatch) note = noteMatch[1].trim();
    
    sheet.appendRow([
      new Date(),
      "Direct Telegram Bot",
      foodName,
      qty,
      totalPrice,
      note,
      user + " (ID: " + chatId + ")"
    ]);
    
    var replyText = "✅ እናመሰግናለን! ትዕዛዝዎ በ Amethyst Dining ሲስተም ላይ በሚገባ ተመዝግቧል። በቅርቡ እናነጋግርዎታለን! 💜";
    sendTelegramMessage(chatId, replyText);
  } else {
    var welcomeText = "እንኳን ወደ Amethyst Dining የትዕዛዝ ቦት በሰላም መጡ! 🍽️\n\nበዌብሳይታችን ላይ የሚፈልጉትን ምግብ መርጠው 'Order Now' የሚለውን ሲጫኑ ይህ ቦት ትዕዛዝዎን በራስ-ሰር ይመዘግባል።";
    sendTelegramMessage(chatId, welcomeText);
  }
}

// ወደ ቴሌግራም መልዕክት መላኪያ ፈንክሽን
function sendTelegramMessage(chatId, text) {
  var url = "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage";
  var payload = {
    "chat_id": chatId,
    "text": text
  };
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };
  UrlFetchApp.fetch(url, options);
}

// ⚠️ ቦቱን እና ስክሪፕቱን ለማገናኘት ይህንን ፈንክሽን አንድ ጊዜ Run ያድርጉት
function setWebhook() {
  var webAppUrl = "YOUR_DEPLOYED_WEB_APP_URL_HERE"; // ይህንን በደረጃ 2 በሚያገኙት Web App URL ይተኩት
  var url = "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/setWebhook?url=" + webAppUrl;
  var response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}
