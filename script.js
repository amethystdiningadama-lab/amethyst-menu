// --- Telegram Bot API Configuration ---
// እባክዎ የራስዎን Bot Token እና Chat ID እዚህ ጋር ያስገቡ
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID_HERE';

let currentUnitPrice = 0;
let currentItemTitle = '';

// --- Helper: HTML Characters Escaping for Telegram ---
function escapeHtml(text) {
    if (!text) return '';
    return text
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

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

    if (tableDiv) tableDiv.style.display = (serviceType === 'Dine-in') ? 'block' : 'none';
    if (deliveryDiv) deliveryDiv.style.display = (serviceType === 'Delivery') ? 'block' : 'none';
    if (appointmentDiv) appointmentDiv.style.display = (serviceType === 'Appointment') ? 'block' : 'none';
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
                    `💰 *ጠቅላላ ዋጋ:* ${total.toLocaleString()} ETB\n` +
                    `📌 *ዓይነት:* ${serviceType} (${detail})\n` +
                    `👤 *ደንበኛ:* ${name}\n` +
                    `📞 *ስልክ:* ${phone}\n` +
                    `💳 *ክፍያ:* ${payment}\n` +
                    `📝 *ማስታወሻ:* ${note}`;

    const encodedMsg = encodeURIComponent(message);

    // Update Links
    const waEl = document.getElementById('modalWaLink');
    const tgEl = document.getElementById('modalTgLink');
    const smsEl = document.getElementById('modalSmsLink');

    if (waEl) waEl.href = `https://wa.me/251969995662?text=${encodedMsg}`;
    if (tgEl) tgEl.href = `https://t.me/share/url?url=&text=${encodedMsg}`;
    if (smsEl) smsEl.href = `sms:+251969995662?body=${encodedMsg}`;
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
        detail = `<b>🪑 የጠረጴዛ ቁጥር:</b> ${escapeHtml(document.getElementById('tableNumber').value || 'አልተጠቀሰም')}`;
    } else if (serviceType === 'Delivery') {
        detail = `<b>🛵 የማድረሻ አድራሻ:</b> ${escapeHtml(document.getElementById('deliveryAddress').value || 'አልተጠቀሰም')}`;
    } else if (serviceType === 'Appointment') {
        detail = `<b>📅 የቀጠሮ ሰዓት:</b> ${escapeHtml(document.getElementById('appointmentTime').value || 'አልተጠቀሰም')}`;
    }

    const currentTime = new Date().toLocaleTimeString('am-ET', { hour: '2-digit', minute: '2-digit' });

    const telegramMessage = `
<b>🛎 አዲስ ትዕዛዝ [${orderId}]</b>
━━━━━━━━━━━━━━━━━━
<b>🍽 ምግብ:</b> ${escapeHtml(currentItemTitle)}
<b>🔢 ብዛት:</b> ${qty}
<b>💰 ጠቅላላ ዋጋ:</b> ${total.toLocaleString()} ETB
<b>📌 ዓይነት:</b> ${escapeHtml(serviceType)}
${detail}
<b>👤 ደንበኛ:</b> ${escapeHtml(name)}
<b>📞 ስልክ:</b> ${escapeHtml(phone)}
<b>💳 የክፍያ መንገድ:</b> ${escapeHtml(payment)}
<b>📝 ማስታወሻ:</b> ${escapeHtml(note)}
━━━━━━━━━━━━━━━━━━
<b>⏰ ሰዓት:</b> ${currentTime}
    `.trim();

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramMessage,
                parse_mode: 'HTML'
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
        const menuGrid = document.getElementById('menuGrid');
        if (menuGrid) menuGrid.appendChild(noResultEl);
    }
    noResultEl.style.display = (count === 0) ? 'block' : 'none';
}

// Close Modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('dynamicOrderModal');
    if (event.target === modal) {
        closeOrderModal();
    }
});
