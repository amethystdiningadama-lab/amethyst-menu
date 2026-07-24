/* ==========================================
   GLOBAL VARIABLES
   ========================================== */
let selectedItemName = '';
let selectedItemPrice = 0;
let currentQuantity = 1;

/* ==========================================
   OPEN & CLOSE MODAL FUNCTIONS
   ========================================== */
function openOrderModal(itemName, itemPrice) {
    selectedItemName = itemName;
    selectedItemPrice = itemPrice;
    currentQuantity = 1;

    // Set title and quantity reset
    document.getElementById('modalFoodTitle').innerText = itemName;
    document.getElementById('orderQty').value = 1;

    // Reset default inputs
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('specialNote').value = '';
    document.getElementById('serviceType').value = 'Dine-in';

    // Update prices & form visibility
    toggleServiceFields();
    calculateTotal();
    updateOrderLinks();

    // Show Modal
    const modal = document.getElementById('dynamicOrderModal');
    modal.style.display = 'flex';
}

function closeOrderModal() {
    const modal = document.getElementById('dynamicOrderModal');
    modal.style.display = 'none';
}

// Window click to close modal if clicked outside
window.onclick = function(event) {
    const modal = document.getElementById('dynamicOrderModal');
    if (event.target === modal) {
        closeOrderModal();
    }
};

/* ==========================================
   QUANTITY & PRICE CALCULATION
   ========================================== */
function changeQty(amount) {
    let qtyInput = document.getElementById('orderQty');
    let newQty = parseInt(qtyInput.value) + amount;

    if (newQty >= 1) {
        qtyInput.value = newQty;
        currentQuantity = newQty;
        calculateTotal();
        updateOrderLinks();
    }
}

function calculateTotal() {
    let totalPrice = selectedItemPrice * currentQuantity;
    document.getElementById('modalTotalPrice').innerText = totalPrice.toLocaleString() + ' ETB';
}

/* ==========================================
   TOGGLE SERVICE FIELDS (Dine-in / Delivery / Appointment)
   ========================================== */
function toggleServiceFields() {
    const serviceType = document.getElementById('serviceType').value;
    const tableField = document.getElementById('tableNumberField');
    const deliveryField = document.getElementById('deliveryAddressField');
    const appointmentField = document.getElementById('appointmentTimeField');

    // Hide all first
    tableField.style.display = 'none';
    deliveryField.style.display = 'none';
    appointmentField.style.display = 'none';

    if (serviceType === 'Dine-in') {
        tableField.style.display = 'block';
    } else if (serviceType === 'Delivery') {
        deliveryField.style.display = 'block';
    } else if (serviceType === 'Appointment') {
        appointmentField.style.display = 'block';
    }
}

/* ==========================================
   DYNAMIC ORDER LINK GENERATOR (WhatsApp / Telegram / SMS)
   ========================================== */
function updateOrderLinks() {
    const serviceType = document.getElementById('serviceType').value;
    const customerName = document.getElementById('customerName').value || 'ያልተጠቀሰ';
    const customerPhone = document.getElementById('customerPhone').value || 'ያልተጠቀሰ';
    const paymentMethod = document.getElementById('paymentMethod').value;
    const specialNote = document.getElementById('specialNote').value || 'የለም';
    const totalPrice = selectedItemPrice * currentQuantity;

    let locationOrDetails = '';
    if (serviceType === 'Dine-in') {
        const table = document.getElementById('tableNumber').value || 'ያልተጠቀሰ';
        locationOrDetails = `🪑 የጠረጴዛ ቁጥር: ${table}`;
    } else if (serviceType === 'Delivery') {
        const addr = document.getElementById('deliveryAddress').value || 'ያልተጠቀሰ';
        locationOrDetails = `📍 ማድረሻ አድራሻ: ${addr}`;
    } else if (serviceType === 'Appointment') {
        const time = document.getElementById('appointmentTime').value || 'ያልተጠቀሰ';
        locationOrDetails = `⏰ የቀጠሮ ሰዓት: ${time}`;
    }

    // Format text message
    let message = `🍽️ *አዲስ የምግብ ትዕዛዝ - AMETHYST DINING*\n\n` +
        `🍕 *ምግብ:* ${selectedItemName}\n` +
        `🔢 *ብዛት:* ${currentQuantity}\n` +
        `💰 *ጠቅላላ ዋጋ:* ${totalPrice.toLocaleString()} ETB\n` +
        `🛎️ *የአገልግሎት ዓይነት:* ${serviceType}\n` +
        `${locationOrDetails}\n\n` +
        `👤 *የደንበኛ ስም:* ${customerName}\n` +
        `📞 *ስልክ ቁጥር:* ${customerPhone}\n` +
        `💳 *የክፍያ መንገድ:* ${paymentMethod}\n` +
        `📝 *ልዩ ማስታወሻ:* ${specialNote}`;

    let encodedMessage = encodeURIComponent(message);

    // Update Links
    document.getElementById('modalWaLink').href = `https://wa.me/251969995662?text=${encodedMessage}`;
    document.getElementById('modalTgLink').href = `https://t.me/Amethyst_Dining?text=${encodedMessage}`;
    document.getElementById('modalSmsLink').href = `sms:+251969995662?body=${encodedMessage}`;
}

/* ==========================================
   ORDER FORM SUBMIT
   ========================================== */
function processOrder(event) {
    event.preventDefault();
    updateOrderLinks();
    
    // Automatically redirect to WhatsApp or Telegram for fast dispatch
    const waUrl = document.getElementById('modalWaLink').href;
    window.open(waUrl, '_blank');
}

/* ==========================================
   SEARCH & FILTER FUNCTIONS
   ========================================== */
function filterMenu() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let items = document.querySelectorAll('.menu-item');

    items.forEach(item => {
        let title = item.querySelector('.item-title').innerText.toLowerCase();
        let desc = item.querySelector('.item-desc').innerText.toLowerCase();

        if (title.includes(input) || desc.includes(input)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function filterCategory(category, event) {
    let buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if (event) event.target.classList.add('active');

    let items = document.querySelectorAll('.menu-item');
    items.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}
