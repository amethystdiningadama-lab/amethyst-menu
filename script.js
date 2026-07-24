// --- Telegram Bot API Configuration ---
// እባክዎ የራስዎን Bot Token እና Chat ID እዚህ ጋር ያስገቡ
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID_HERE';

let currentUnitPrice = 0;
let currentItemTitle = '';

// --- Open Order Modal ---
function openOrderModal(title, price) {
    currentItemTitle = title;
    currentUnitPrice = price;
    
    document.getElementById('modalFoodTitle').innerText = title;
    document.getElementById('orderQty').value = 1;
    
    calculateTotal();
    toggleServiceFields();
    updateOrderLinks();
    
    document.getElementById('dynamicOrderModal').style.display = 'flex';
}

// --- Close Order Modal ---
function closeOrderModal() {
    document.getElementById('dynamicOrderModal').style.display = 'none';
}

// --- Change Quantity ---
function changeQty(delta) {
    let qtyInput = document.getElementById('orderQty');
    let currentQty = parseInt(qtyInput.value) || 1;
    currentQty += delta;
    
    if (currentQty < 1) currentQty = 1;
    qtyInput.value = currentQty;
    
    calculateTotal();
    updateOrderLinks();
}

// --- Calculate Total Price ---
function calculateTotal() {
    let qty = parseInt(document.getElementById('orderQty').value) || 1;
    let total = qty * currentUnitPrice;
    document.getElementById('modalTotalPrice').innerText = total.toLocaleString() + ' ETB';
    return total;
}

// --- Toggle Fields Based on Service Type ---
function toggleServiceFields() {
    const serviceType = document.getElementById('serviceType').value;
    const tableDiv = document.getElementById('tableNumberField');
    const deliveryDiv = document.getElementById('deliveryAddressField');
    const appointmentDiv = document.getElementById('appointmentTimeField');

    if(tableDiv) tableDiv.style.display = (serviceType === 'Dine-in') ? 'block' : 'none';
    if(deliveryDiv) deliveryDiv.style.display = (serviceType === 'Delivery') ? 'block' : 'none';
    if(appointmentDiv) appointmentDiv.style.display = (serviceType === 'Appointment') ? 'block' : 'none';
}

// --- Update Dynamic External Links (WhatsApp, Direct TG, SMS) ---
function updateOrderLinks() {
    const qty = document.getElementById('orderQty').value || 1;
    const total = calculateTotal();
    const serviceType = document.getElementById('serviceType').value;
    const name = document.getElementById('customerName').value || 'አልተጠቀሰም';
    const phone = document.getElementById('customerPhone').value || 'አልተጠቀሰም';
    const payment = document.getElementById('paymentMethod').value;
    const note = document.getElementById('specialNote').value || 'የለም';
    
    let detail = '';
    if (serviceType === 'Dine-in') {
        detail = `የጠረጴዛ ቁጥር: ${document.getElementById('tableNumber').value || 'አልተጠቀሰም'}`;
    } else if (serviceType === 'Delivery') {
        detail = `የማድረሻ አድራሻ: ${document.getElementById('deliveryAddress').value || 'አልተጠቀሰም'}`;
    } else if (serviceType === 'Appointment') {
        detail = `የቀጠሮ ሰዓት: ${document.getElementById('appointmentTime').value || 'አልተጠቀሰም'}`;
    }

    const message = `🛎 *አዲስ ትዕዛዝ [AMETHYST DINING]*\n` +
                    `🍽 *ምግብ:* ${currentItemTitle}\n` +
                    `🔢 *ብዛት:* ${qty}\n` +
                    `💰 *ጠቅላላ ዋጋ:* ${total} ETB\n` +
                    `📌 *ዓይነት:* ${serviceType} (${detail})\n` +
                    `👤 *ደንበኛ:* ${name}\n` +
                    `📞 *ስልክ:* ${phone}\n` +
                    `💳 *ክፍያ:* ${payment}\n` +
                    `📝 *ማስታወሻ:* ${note}`;

    const encodedMsg = encodeURIComponent(message);

    // Update Links
    document.getElementById('modalWaLink').href = `https://wa.me/251969995662?text=${encodedMsg}`;
    document.getElementById('modalTgLink').href = `https://t.me/share/url?url=&text=${encodedMsg}`;
    document.getElementById('modalSmsLink').href = `sms:+251969995662?body=${encodedMsg}`;
}

// --- Process Order directly via Telegram Bot ---
async function processOrder(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitOrderBtn');
    submitBtn.innerText = 'እየተላከ ነው...';
    submitBtn.disabled = true;

    const orderId = 'AMD-' + Math.floor(100000 + Math.random() * 900000);
    const qty = document.getElementById('orderQty').value || 1;
    const total = calculateTotal();
    const serviceType = document.getElementById('serviceType').value;
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const payment = document.getElementById('paymentMethod').value;
    const note = document.getElementById('specialNote').value || 'የለም';

    let detail = '';
    if (serviceType === 'Dine-in') {
        detail = `🪑 **የጠረጴዛ ቁጥር:** ${document.getElementById('tableNumber').value || 'አልተጠቀሰም'}`;
    } else if (serviceType === 'Delivery') {
        detail = `🛵 **የማድረሻ አድራሻ:** ${document.getElementById('deliveryAddress').value || 'አልተጠቀሰም'}`;
    } else if (serviceType === 'Appointment') {
        detail = `📅 **የቀጠሮ ሰዓት:** ${document.getElementById('appointmentTime').value || 'አልተጠቀሰም'}`;
    }

    const telegramMessage = `
🛎 **አዲስ ትዕዛዝ [${orderId}]**
━━━━━━━━━━━━━━━━━━
🍽 **ምግብ:** ${currentItemTitle}
🔢 **ብዛት:** ${qty}
💰 **ጠቅላላ ዋጋ:** ${total} ETB
📌 **ዓይነት:** ${serviceType}
${detail}
👤 **ደንበኛ:** ${name}
📞 **ስልክ:** ${phone}
💳 **የክፍያ መንገድ:** ${payment}
📝 **ማስታወሻ:** ${note}
━━━━━━━━━━━━━━━━━━
⏰ **ሰዓት:** ${new Date().toLocaleTimeString('et-ET')}
    `;

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramMessage,
                parse_mode: 'Markdown'
            })
        });

        if (response.ok) {
            alert(`ትዕዛዝዎ በተሳካ ሁኔታ ተልኳል!\nየማጣቀሻ ቁጥርዎ: ${orderId}`);
            closeOrderModal();
            document.getElementById('orderForm').reset();
        } else {
            alert('ትዕዛዙን በቦት ማስተላለፍ አልተቻለም። እባክዎ በ script.js ውስጥ Bot Token እና Chat ID ማስተካከልዎን ያረጋግጡ። ወይም ከታች ያሉትን የ WhatsApp/Telegram አማራጮች ይጠቀሙ።');
        }
    } catch (error) {
        console.error('Error sending order:', error);
        alert('የኔትወርክ ስህተት አጋጥሟል። እባክዎ ኢንተርኔትዎን ያረጋግጡ።');
    } finally {
        submitBtn.innerText = 'በቴሌግራም ቦት በቀጥታ ይላኩ';
        submitBtn.disabled = false;
    }
}

// --- Filtering Functions ---
function filterCategory(category, evt) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (evt && evt.target) {
        evt.target.classList.add('active');
    }

    let visibleCount = 0;
    document.querySelectorAll('.menu-item').forEach(item => {
        let isMatch = (category === 'all' || item.getAttribute('data-category') === category);
        item.style.display = isMatch ? 'flex' : 'none';
        if (isMatch) visibleCount++;
    });

    toggleNoResults(visibleCount);
}

function filterMenu() {
    let keyword = document.getElementById('searchInput').value.toLowerCase();
    let visibleCount = 0;

    document.querySelectorAll('.menu-item').forEach(item => {
        let text = item.innerText.toLowerCase();
        let isMatch = text.includes(keyword);
        item.style.display = isMatch ? 'flex' : 'none';
        if (isMatch) visibleCount++;
    });

    toggleNoResults(visibleCount);
}

function toggleNoResults(count) {
    let noResultEl = document.getElementById('noResultsMsg');
    if (!noResultEl) {
        noResultEl = document.createElement('div');
        noResultEl.id = 'noResultsMsg';
        noResultEl.style.cssText = 'text-align:center; padding:30px; width:100%; color:#d4af37;';
        noResultEl.innerHTML = '<i class="fas fa-search-minus" style="font-size:2.5rem; margin-bottom:10px;"></i><p>ምንም የተገኘ ምግብ የለም</p>';
        document.getElementById('menuGrid').appendChild(noResultEl);
    }
    noResultEl.style.display = (count === 0) ? 'block' : 'none';
}

// Close Modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('dynamicOrderModal');
    if (event.target === modal) {
        closeOrderModal();
    }
};
