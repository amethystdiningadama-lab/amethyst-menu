// ==========================================
// AMETHYST DINING - INTERACTION LOGIC (V2.2)
// DEVELOPED FOR: MAKBEL ASCHALEW
// ==========================================

var APPS_SCRIPT_URL = "YOUR_DEPLOYED_WEB_APP_URL_HERE"; 

var currentFoodName = "";
var currentFoodPrice = 0;
var activeCategory = "all";

// 1. የካቴጎሪ ማጣሪያ ፈንክሽን
function filterCategory(category, buttonElement) {
    activeCategory = category;
    let buttons = document.getElementsByClassName('category-btn');
    for (let btn of buttons) {
        btn.classList.remove('active');
    }
    buttonElement.classList.add('active');
    runFilters();
}

// 2. የፍለጋ አሞሌ (Search) ፈንክሽን
function filterMenu() {
    runFilters();
}

// 3. ሁለቱንም ማጣሪያዎች አንድ ላይ አጣምሮ የሚሰራ ዋና ፈንክሽን
function runFilters() {
    let searchValue = document.getElementById('searchBar').value.toLowerCase();
    let cards = document.getElementsByClassName('menu-card');
    
    for (let card of cards) {
        let cardCategory = card.getAttribute('data-category');
        let cardName = card.querySelector('h3').innerText.toLowerCase();
        
        let matchesCategory = (activeCategory === "all" || cardCategory === activeCategory);
        let matchesSearch = cardName.includes(searchValue);
        
        if (matchesCategory && matchesSearch) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    }
}

// ሞዳሉን መክፈቻ ፈንክሽን
function openOrderModal(foodName, price) {
    currentFoodName = foodName;
    currentFoodPrice = parseFloat(price);
    
    document.getElementById('modalFoodName').innerText = foodName;
    document.getElementById('orderQty').value = 1;
    document.getElementById('specialNote').value = "";
    
    updateTotalPrice();
    document.getElementById('orderModal').style.display = 'block';
}

// ሞዳሉን መዝጊያ ፈንክሽን
function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
}

// የምግብ ብዛት ማስተካከያ (+ እና - ሲጫኑ)
function changeQty(amount) {
    let qtyInput = document.getElementById('orderQty');
    let currentQty = parseInt(qtyInput.value) || 1;
    let newQty = currentQty + amount;
    if (newQty >= 1) {
        qtyInput.value = newQty;
        updateTotalPrice();
    }
}

// ጠቅላላ ዋጋን ማስሊያ
function updateTotalPrice() {
    let qty = parseInt(document.getElementById('orderQty').value) || 1;
    let totalPrice = currentFoodPrice * qty;
    document.getElementById('modalTotalPrice').innerText = totalPrice.toLocaleString() + " ETB";
}

// መረጃን ወደ መተግበሪያዎች ማስተላለፊያ ዋና ሲስተም
function submitAndRedirect(channel) {
    let qty = parseInt(document.getElementById('orderQty').value) || 1;
    let note = document.getElementById('specialNote').value.trim();
    let totalPrice = currentFoodPrice * qty;
    
    // የጀርባ ሺት መመዝገቢያ (ከተገናኘ)
    let payload = {
        action: "log_web_order",
        source: "Web-" + channel,
        foodName: currentFoodName,
        quantity: qty,
        totalPrice: totalPrice,
        note: note || "-"
    };
    
    fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        cache: "no-cache",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    }).catch(err => console.log("Background log updated."));
    
    // ለደንበኛው የሚዘጋጅ የትዕዛዝ መልዕክት ፎርማት
    let messageText = `🍽️ አዲስ ትዕዛዝ ማቅረብ እፈልጋለሁ\n\n`;
    messageText += `▪️ የምግብ ስም: ${currentFoodName}\n`;
    messageText += `▪️ የምግብ ብዛት: ${qty}\n`; 
    messageText += `▪️ ጠቅላላ ዋጋ: ${totalPrice.toLocaleString()} ETB\n`; 
    if (note !== "") {
        messageText += `▪️ ልዩ ፍላጎት: ${note}\n`;
    }
    
    let encodedMessage = encodeURIComponent(messageText);
    let redirectUrl = "";
    
    // ወደ ተመረጠው የእርስዎ የግል መስመር ማስተላለፊያ (+251969995662)
    if (channel === 'WhatsApp') {
        redirectUrl = "https://wa.me/251969995662?text=" + encodedMessage;
    } else if (channel === 'Telegram') {
        redirectUrl = "https://t.me/mr_makbel_aschalew?text=" + encodedMessage;
    } else if (channel === 'SMS') {
        redirectUrl = "sms:+251969995662?body=" + encodedMessage;
    }
    
    if (redirectUrl !== "") {
        window.open(redirectUrl, '_blank');
    }
    closeOrderModal();
}

window.onclick = function(event) {
    let modal = document.getElementById('orderModal');
    if (event.target == modal) {
        closeOrderModal();
    }
}
