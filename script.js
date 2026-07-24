// --- Category Filtering (የምግብ ምድብ ማጣሪያ) ---
function filterCategory(category) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    if (event && event.target) {
        event.target.classList.add('active');
    }

    document.querySelectorAll('.menu-item').forEach(item => {
        let itemCat = item.getAttribute('data-category');
        item.style.display = (category === 'all' || itemCat === category) ? 'flex' : 'none';
    });
}

// --- Menu Search (ምግብ መፈለጊያ) ---
function filterMenu() {
    let k = document.getElementById('searchInput').value.toLowerCase().trim();
    document.querySelectorAll('.menu-item').forEach(i => {
        let textContent = i.innerText.toLowerCase();
        i.style.display = (textContent.includes(k)) ? 'flex' : 'none';
    });
}

// --- Dynamic Modal Operations (የትዕዛዝ ሞዳል ስራዎች) ---
let currentFoodName = ""; 
let currentFoodPrice = 0; 

// ሞዳሉን (Popup) መክፈት
function openOrderModal(foodName, price) {
    currentFoodName = foodName;
    currentFoodPrice = price;
    document.getElementById('modalFoodTitle').innerText = foodName;
    
    document.getElementById('orderQty').value = 1;
    document.getElementById('specialNote').value = "";
    
    updateOrderLinks();
    
    document.getElementById('dynamicOrderModal').style.display = 'flex';
}

// የምግብ ብዛት መጨመሪያ እና መቀነሻ (+/-)
function changeQty(amount) {
    let qtyInput = document.getElementById('orderQty');
    let currentVal = parseInt(qtyInput.value) || 1;
    let newVal = currentVal + amount;
    
    if (newVal < 1) newVal = 1; 
    
    qtyInput.value = newVal;
    updateOrderLinks();
}

// ጠቅላላ ዋጋን ማስላት እና የትዕዛዝ ሊንኮችን ማዘመን
function updateOrderLinks() {
    let qty = parseInt(document.getElementById('orderQty').value) || 1;
    let note = document.getElementById('specialNote').value.trim();
    
    let totalPrice = currentFoodPrice * qty;
    
    document.getElementById('modalTotalPrice').innerText = totalPrice.toLocaleString() + " ETB";
    
    let messageText = `🍽️ አዲስ ትዕዛዝ ማቅረብ እፈልጋለሁ\n\n`;
    messageText += `▪️ የምግብ ስም: ${currentFoodName}\n`;
    messageText += `▪️ የምግብ ብዛት: ${qty}\n`; 
    messageText += `▪️ ጠቅላላ ዋጋ: ${totalPrice.toLocaleString()} ETB\n`; 
    
    if (note !== "") {
        messageText += `▪️ ልዩ ፍላጎት: ${note}\n`;
    }
    
    messageText += `\n(ክፍያ በቴሌብር/ንግድ ባንክ ተፈጽሟል፣ ደረሰኙ ከዚህ ጋር ተያይዟል)`;
    
    let encodedMessage = encodeURIComponent(messageText);
    
    // ትክክለኛው የሬስቶራንቱ ስልክ ቁጥር (+251969995662) እዚህ ተካቷል
    document.getElementById('modalFormLink').href = "https://docs.google.com/forms/d/e/1FAIpQLScn5gOT0ZfgeIgKvBxCWlnFHlSzto6YoehbYGtWpeYXRQrV8Q/viewform";
    document.getElementById('modalWaLink').href = "https://wa.me/251969995662?text=" + encodedMessage;
    document.getElementById('modalTgLink').href = "https://t.me/mr_makbel_aschalew?text=" + encodedMessage;
    document.getElementById('modalSmsLink').href = "sms:+251969995662?body=" + encodedMessage;
}

// ሞዳሉን መዝጋት
function closeOrderModal() {
    document.getElementById('dynamicOrderModal').style.display = 'none';
}

// ሞዳሉን ከሳጥኑ ውጭ ሲጫኑ እንዲዘጋ ማድረግ
window.onclick = function(event) {
    let modal = document.getElementById('dynamicOrderModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
