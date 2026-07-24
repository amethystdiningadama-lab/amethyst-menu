// --- Telegram Bot API Configuration ---
// እባክዎ የራስዎን Bot Token እና Chat ID እዚህ ጋር ያስገቡ
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID_HERE';

// --- Category Filtering (የተስተካከለ Event Handling) ---
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

// --- Real-time Search Function ---
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

// --- Empty Search Results State ---
function toggleNoResults(count) {
    let noResultEl = document.getElementById('noResultsMsg');
    if (!noResultEl) {
        noResultEl = document.createElement('div');
        noResultEl.id = 'noResultsMsg';
        noResultEl.className = 'no-results';
        noResultEl.innerHTML = '<i class="fas fa-search-minus" style="font-size:2.5rem; margin-bottom:10px; color:#d4af37;"></i><p>ምንም የተገኘ ምግብ ወይም አገልግሎት የለም</p>';
        document.getElementById('menuGrid').appendChild(noResultEl);
    }
    noResultEl.style.display = (count === 0) ? 'block' : 'none';
}

// --- Modal Controls ---
function openModal(title, price) {
    document.getElementById('modalItemTitle').innerText = title;
    document.getElementById('modalItemPrice').innerText = price;
    document.getElementById('orderModal').style.display = 'flex';
    toggleServiceFields(); // Dynamic inputs reset
}

function closeModal() {
    document.getElementById('orderModal').style.display = 'none';
}

// --- Toggle Input Fields Based on Service Type ---
function toggleServiceFields() {
    const serviceType = document.getElementById('serviceType').value;
    const tableDiv = document.getElementById('tableNumberField');
    const deliveryDiv = document.getElementById('deliveryAddressField');
    const appointmentDiv = document.getElementById('appointmentTimeField');

    tableDiv.style.display = (serviceType === 'Dine-in') ? 'block' : 'none';
    deliveryDiv.style.display = (serviceType === 'Delivery') ? 'block' : 'none';
    appointmentDiv.style.display = (serviceType === 'Appointment') ? 'block' : 'none';
}

// --- Advanced Order Processing & Telegram Bot Dispatch ---
async function processAdvancedOrder(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('submitOrderBtn');
    submitBtn.innerText = 'እየተላከ ነው...';
    submitBtn.disabled = true;

    // Unique Order Identifier
    const orderId = 'AMD-' + Math.floor(100000 + Math.random() * 900000);

    const itemName = document.getElementById('modalItemTitle').innerText;
    const itemPrice = document.getElementById('modalItemPrice').innerText;
    const serviceType = document.getElementById('serviceType').value;
    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const specialNote = document.getElementById('specialNote').value || 'የለም';

    // Build specific detail row according to service selection
    let serviceDetail = '';
    if (serviceType === 'Dine-in') {
        serviceDetail = `🪑 **የጠረጴዛ ቁጥር:** ${document.getElementById('tableNumber').value || 'አልተጠቀሰም'}`;
    } else if (serviceType === 'Delivery') {
        serviceDetail = `🛵 **የማድረሻ አድራሻ:** ${document.getElementById('deliveryAddress').value || 'አልተጠቀሰም'}`;
    } else if (serviceType === 'Appointment') {
        serviceDetail = `📅 **የቀጠሮ ሰዓት:** ${document.getElementById('appointmentTime').value || 'አልተጠቀሰም'}`;
    }

    // Formatted Telegram Message
    const telegramMessage = `
🛎 **አዲስ ትዕዛዝ / ቀጠሮ [${orderId}]**
━━━━━━━━━━━━━━━━━━
🍽 **ምግብ/አገልግሎት:** ${itemName}
💰 **ዋጋ:** ${itemPrice}
📌 **ዓይነት:** ${serviceType}
${serviceDetail}
👤 **ደንበኛ:** ${customerName}
📞 **ስልክ:** ${customerPhone}
💳 **የክፍያ መንገድ:** ${paymentMethod}
📝 **ማስታወሻ:** ${specialNote}
━━━━━━━━━━━━━━━━━━
🔴 **የክፍያ ሁኔታ:** አልደረሰም (Pending)
🛵 **የማድረስ/ማስተናገድ ሁኔታ:** በመጠበቅ ላይ
⏰ **ሰዓት:** ${new Date().toLocaleTimeString('et-ET')}
    `;

    // Admin Inline Keyboard Buttons for Status Tracking
    const replyMarkup = {
        inline_keyboard: [
            [
                { text: "✅ ክፍያ ደርሷል (Paid)", callback_data: `paid_${orderId}` },
                { text: "❌ ተሰርዟል (Canceled)", callback_data: `cancel_${orderId}` }
            ],
            [
                { text: "🛵 በጉዞ ላይ / በሂደት", callback_data: `delivering_${orderId}` },
                { text: "🏁 ተጠናቋል (Completed)", callback_data: `complete_${orderId}` }
            ]
        ]
    };

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramMessage,
                parse_mode: 'Markdown',
                reply_markup: replyMarkup
            })
        });

        if (response.ok) {
            alert(`ትዕዛዝዎ በተሳካ ሁኔታ ተልኳል!\nየማጣቀሻ ቁጥርዎ: ${orderId}`);
            closeModal();
            document.getElementById('orderForm').reset();
        } else {
            alert('ትዕዛዙን ማስተላለፍ አልተቻለም። እባክዎ በ script.js ውስጥ Bot Token እና Chat ID ማስተካከልዎን ያረጋግጡ።');
        }
    } catch (error) {
        console.error('Error sending order:', error);
        alert('የኔትወርክ ስህተት አጋጥሟል። እባክዎ ኢንተርኔትዎን ያረጋግጡ።');
    } finally {
        submitBtn.innerText = 'ትዕዛዙን አስተላልፍ';
        submitBtn.disabled = false;
    }
}

// Window click event to close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target === modal) {
        closeModal();
    }
};
