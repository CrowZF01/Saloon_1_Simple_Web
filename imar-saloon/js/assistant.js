/* ==========================================================
   imar-salon/js/assistant.js
   Virtual AI Assistant Imar Salon (Powered by OpenRouter)
   ========================================================== */

import { supabase } from '../connection/supabase.js';

// ==========================================
// CONFIGURATION (PENGATURAN)
// ==========================================
// TODO: API Key OpenRouter akan diambil secara dinamis dari database Supabase
let OPENROUTER_API_KEY = "";
const OPENROUTER_MODEL = "openai/gpt-4o-mini";

// Cache data dari database
let cachedServices = [];
let cachedPricingItems = [];
let cachedFaqs = [];
let isDataLoaded = false;

// History percakapan (maksimal 10 pesan terakhir agar hemat token & kontekstual)
let chatHistory = [];

// ==========================================
// 1. INJEKSI WIDGET HTML SECARA DINAMIS
// ==========================================
function injectChatWidget() {
    // 1. Tambahkan stylesheet asisten ke head
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    // Gunakan path absolut/relatif yang tepat tergantung di mana file berada
    const isSubPage = window.location.pathname.includes('/pages/');
    link.href = isSubPage ? '../css/assistant.css' : 'css/assistant.css';

    // Helper untuk merender widget
    const renderWidget = () => {
        // Jika widget sudah terlanjur dirender, abaikan (mencegah double render jika onload & onerror terpicu bersamaan)
        if (document.getElementById('imar-assistant-widget')) return;

        // 2. Buat elemen widget chat
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'imar-assistant-widget';

        // Path aset gambar logo (sesuaikan jika berada di halaman utama atau sub-halaman)
        const logoSrc = isSubPage ? '../assets/logo_imar.webp' : 'assets/logo_imar.webp';

        widgetContainer.innerHTML = `
            <!-- Chat Window -->
            <div class="assistant-chat-window" id="assistantChatWindow">
                <!-- Header -->
                <div class="assistant-chat-header">
                    <div class="assistant-info">
                        <img src="${logoSrc}" alt="Avatar Imar" class="assistant-avatar">
                        <div class="assistant-status-details">
                            <h4>Asisten Imar Salon</h4>
                            <div class="assistant-status">
                                <span class="assistant-status-dot"></span>
                                <span>Aktif</span>
                            </div>
                        </div>
                    </div>
                    <button class="assistant-close-btn" id="assistantCloseBtn" title="Tutup Chat">
                        <svg viewBox="0 0 24 24">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>

                <!-- Messages Container -->
                <div class="assistant-chat-messages" id="assistantMessages">
                    <!-- Sambutan Awal -->
                    <div class="assistant-message assistant-message-received">
                        Halo Kak! Selamat datang di <strong>Imar Salon</strong>. 🌸<br><br>Saya asisten virtual Anda di sini. Ada yang bisa saya bantu terkait daftar layanan, harga, lokasi, atau jam buka kami?
                    </div>
                </div>

                <!-- Quick Replies -->
                <div class="assistant-quick-replies" id="assistantQuickReplies">
                    <button class="assistant-quick-reply-btn" data-question="Daftar harga layanan Imar Salon">✂️ Daftar Harga</button>
                    <button class="assistant-quick-reply-btn" data-question="Di mana alamat lokasinya?">📍 Alamat & Lokasi</button>
                    <button class="assistant-quick-reply-btn" data-question="Bagaimana cara reservasi?">📅 Cara Booking</button>
                    <button class="assistant-quick-reply-btn" data-question="Bisa bayar pakai apa saja?">💳 Pembayaran</button>
                </div>

                <!-- Input Area -->
                <form class="assistant-chat-input-form" id="assistantInputForm">
                    <input type="text" class="assistant-chat-input" id="assistantInput" placeholder="Tulis pertanyaan Anda..." required autocomplete="off">
                    <button type="submit" class="assistant-send-btn" title="Kirim">
                        <svg viewBox="0 0 24 24">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </form>
            </div>

            <!-- Floating Button -->
            <button class="assistant-chat-toggle" id="assistantToggleBtn" title="Tanya Asisten Virtual">
                <svg viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/>
                </svg>
            </button>
        `;

        document.body.appendChild(widgetContainer);
        setupEventListeners();

        // Aktifkan transisi animasi setelah render selesai (menghindari transisi default dari unstyled ke styled)
        setTimeout(() => {
            const chatWindow = document.getElementById('assistantChatWindow');
            if (chatWindow) {
                chatWindow.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
            }
        }, 100);
    };

    // Pemicu rendering setelah CSS selesai dimuat
    link.onload = renderWidget;
    link.onerror = renderWidget; // Fallback jika gagal memuat stylesheet
    document.head.appendChild(link);
}

// ==========================================
// 2. EVENT LISTENERS MANAGEMENT
// ==========================================
function setupEventListeners() {
    const toggleBtn = document.getElementById('assistantToggleBtn');
    const closeBtn = document.getElementById('assistantCloseBtn');
    const chatWindow = document.getElementById('assistantChatWindow');
    const inputForm = document.getElementById('assistantInputForm');
    const inputField = document.getElementById('assistantInput');
    const quickReplyBtns = document.querySelectorAll('.assistant-quick-reply-btn');

    // Buka/Tutup Chat
    toggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
        if (chatWindow.classList.contains('active')) {
            inputField.focus();
            lazyLoadDatabase(); // Ambil data Supabase jika belum dimuat
        }
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    // Kirim via Form
    inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = inputField.value.trim();
        if (!text) return;

        handleUserMessage(text);
        inputField.value = '';
    });

    // Kirim via Quick Reply
    quickReplyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.getAttribute('data-question');
            handleUserMessage(question);
        });
    });
}

// ==========================================
// 3. LAZY LOAD DATA DARI SUPABASE
// ==========================================
async function lazyLoadDatabase() {
    if (isDataLoaded) return;

    try {
        console.log("Mengambil data referensi dari Supabase...");

        // Ambil data layanan utama
        const { data: services, error: sErr } = await supabase
            .from('services')
            .select('*');
        if (!sErr && services) cachedServices = services;

        // Ambil data item harga rinci
        const { data: pricing, error: pErr } = await supabase
            .from('pricing_items')
            .select('*');
        if (!pErr && pricing) cachedPricingItems = pricing;

        // Ambil data FAQ
        const { data: faqs, error: fErr } = await supabase
            .from('faqs')
            .select('*');
        if (!fErr && faqs) cachedFaqs = faqs;

        isDataLoaded = true;
        console.log("Data referensi berhasil dimuat ke cache.");
    } catch (err) {
        console.error("Gagal mengambil data dari Supabase:", err);
    }
}

// ==========================================
// 4. MANAGEMENT PESAN & UI
// ==========================================
function appendMessage(text, sender, isHtml = false) {
    const container = document.getElementById('assistantMessages');
    const msgElement = document.createElement('div');
    msgElement.className = `assistant-message ${sender === 'user' ? 'assistant-message-sent' : 'assistant-message-received'}`;

    if (isHtml) {
        msgElement.innerHTML = text;
    } else {
        msgElement.textContent = text;
    }

    container.appendChild(msgElement);
    container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
    const container = document.getElementById('assistantMessages');
    const indicator = document.createElement('div');
    indicator.className = 'assistant-typing-indicator';
    indicator.id = 'assistantTypingIndicator';
    indicator.innerHTML = `
        <span class="assistant-typing-dot"></span>
        <span class="assistant-typing-dot"></span>
        <span class="assistant-typing-dot"></span>
    `;
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('assistantTypingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Handler utama saat pengguna mengirim pesan
async function handleUserMessage(messageText) {
    // 1. Tampilkan pesan user di UI
    appendMessage(messageText, 'user');

    // 2. Simpan pesan user ke history lokal
    chatHistory.push({ role: "user", content: messageText });
    if (chatHistory.length > 10) chatHistory.shift(); // Batasi 10 riwayat pesan

    // 3. Tampilkan indikator mengetik
    showTypingIndicator();

    // 4. Hubungi OpenRouter API
    const reply = await getAiResponse();

    // 5. Hilangkan indikator mengetik
    removeTypingIndicator();

    // 6. Tampilkan respon AI ke UI
    appendMessage(reply, 'assistant', true);

    // 7. Simpan pesan asisten ke history lokal (tanpa format HTML mentah jika memungkinkan)
    chatHistory.push({ role: "assistant", content: reply.replace(/<[^>]*>/g, '') }); // Bersihkan tag html sederhana untuk history
    if (chatHistory.length > 10) chatHistory.shift();
}

// ==========================================
// 5. LOGIKA GENERATE PROMPT & OPENROUTER CALL
// ==========================================

// Fungsi merakit System Prompt terstruktur
function buildSystemPrompt() {
    // 1. Siapkan teks ringkasan Layanan & Harga
    let pricingContext = "";
    if (cachedServices.length > 0) {
        cachedServices.forEach(category => {
            pricingContext += `\nKategori: ${category.name}\n`;
            const items = cachedPricingItems.filter(item => item.service_id === category.id);
            if (items.length > 0) {
                items.forEach(item => {
                    const priceFormatted = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price);
                    const prefix = item.is_starting_price ? "Mulai dari " : "";
                    pricingContext += `- ${item.item_name}: ${prefix}${priceFormatted}\n`;
                });
            } else {
                pricingContext += `- (Tidak ada rincian item)\n`;
            }
        });
    } else {
        // Fallback jika database gagal di-load
        pricingContext = `
        - Pot + Blow: Rp 30.000
        - Potong: Rp 20.000
        - Cuci Kering: Rp 20.000
        - Cuci Blow: Mulai dari Rp 30.000
        - Catok Lurus: Mulai dari Rp 20.000
        - Catok Curly: Mulai dari Rp 35.000
        - Colouring: Mulai dari Rp 85.000
        - Highlight: Mulai dari Rp 100.000
        - Smoothing: Mulai dari Rp 160.000
        - Smoothing Keratin: Mulai dari Rp 185.000
        - Creambath: Mulai dari Rp 50.000
        - Hairmask: Mulai dari Rp 60.000
        - Keriting Gantung: Mulai dari Rp 160.000
        - Facial: Mulai dari Rp 50.000
        - Make-Up Hairdo: Mulai dari Rp 175.000
        - Sewa Kebaya: Mulai dari Rp 75.000
        - Sewa Jas: Mulai dari Rp 100.000
        `;
    }

    // 2. Siapkan teks FAQ
    let faqContext = "";
    if (cachedFaqs.length > 0) {
        cachedFaqs.forEach((faq, index) => {
            faqContext += `${index + 1}. Q: ${faq.question} | A: ${faq.answer}\n`;
        });
    }

    // 3. Gabungkan seluruh prompt instruksi & database
    const systemPrompt = `
Kamu adalah asisten virtual resmi Imar Salon (salon kecantikan di Yogyakarta). Tugasmu adalah membantu menjawab pertanyaan calon pelanggan dengan ramah, hangat, sopan, dan profesional.

ATURAN PERILAKU:
1. Selalu panggil pelanggan dengan sebutan "Kak" atau "Kakak".
2. Gunakan gaya bahasa yang ramah, sopan, dan berikan emoji salon yang manis (🌸, ✂️, 💅, 💇‍♀️, ✨) sewajarnya agar terkesan hangat.
3. Jawablah secara singkat dan padat agar mudah dibaca di layar chat yang kecil.
4. Jika pelanggan bertanya tentang RESERVASI / BOOKING / PESAN TEMPAT, informasikan bahwa reservasi dilakukan langsung dengan mengklik link WhatsApp admin yang kamu sediakan.
5. PENTING: Kamu HANYA boleh menjawab pertanyaan seputar Imar Salon (seperti harga, layanan, lokasi, jam buka, pembayaran, dll.). Jika pengguna menanyakan hal lain di luar salon (misalnya tentang matematika, coding, berita politik, resep makanan, dll.), tolaklah secara halus dan katakan bahwa kamu hanya asisten virtual Imar Salon.
6. PENTING: Jangan berhalusinasi atau mengada-ada layanan/harga yang tidak ada di daftar di bawah ini. Jika ada layanan yang ditanyakan tetapi tidak ada di daftar, katakan layanan tersebut belum tersedia saat ini.

INFORMASI TOKO (STATIS):
- Nama Salon: Imar Salon
- Slogan: Salon Simple & Sederhana
- Alamat: JL. Demakan no 94, Daerah Istimewa Yogyakarta (DIY), Indonesia (Bisa dicari di Google Maps).
- Jam Buka: Senin - Minggu, pukul 08:00 - 21:00 WIB.
- Nomor Kontak WhatsApp: +62 815-7092-463 (Pesan chat saja, tidak menerima telepon langsung).

DAFTAR LAYANAN & HARGA AKTUAL (DARI DATABASE):
${pricingContext}

TANYA JAWAB UMUM / FAQ OPERASIONAL (DARI DATABASE):
${faqContext}

FORMAT JAWABAN:
Jika memberikan rekomendasi booking/reservasi, selalu sertakan arahan untuk menghubungi WhatsApp. Kamu bisa menggunakan format HTML sederhana (seperti <strong>teks tebal</strong> atau <br> untuk baris baru) untuk merapikan jawabanmu agar enak dilihat di chat. Jangan gunakan markdown bold (**), gunakan tag <strong>.
`;

    return systemPrompt;
}

// Fungsi Fetch ke OpenRouter API
async function getAiResponse() {
    // Ambil API Key secara dinamis dari Supabase jika belum dimuat
    if (!OPENROUTER_API_KEY) {
        try {
            const { data, error } = await supabase
                .from('app_config')
                .select('value')
                .eq('key', 'openrouter_key')
                .single();

            if (!error && data && data.value) {
                OPENROUTER_API_KEY = data.value;
            } else {
                console.error("Gagal mengambil API Key dari Supabase:", error);
            }
        } catch (err) {
            console.error("Error fetching API Key:", err);
        }
    }

    // 1. Validasi API Key Terlebih Dahulu
    if (!OPENROUTER_API_KEY) {
        return `
            <strong>Pemberitahuan Sistem:</strong><br>
            Halo! Chatbot gagal memuat API Key dari database Supabase. Pastikan tabel <code>app_config</code> Anda terisi dengan benar.
        `;
    }

    try {
        const systemPrompt = buildSystemPrompt();

        // Susun payload request
        const messagesPayload = [
            { role: "system", content: systemPrompt },
            ...chatHistory
        ];

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.origin, // Diperlukan oleh OpenRouter
                "X-Title": "Imar Salon Assistant"     // Nama aplikasi Anda di dashboard OpenRouter
            },
            body: JSON.stringify({
                model: OPENROUTER_MODEL,
                messages: messagesPayload,
                temperature: 0.7,
                max_tokens: 400
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        let aiReply = data.choices[0].message.content;

        // Format jika ada ** ... ** maka kalimat ditengahnya itu di bold
        if (aiReply) {
            aiReply = aiReply.replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>');

            // Format tanda hubung " - " agar menjadi baris baru (kecuali rentang hari/jam)
            aiReply = aiReply.replace(/(\s+-\s+)/g, (match, p1, offset, string) => {
                const before = string.slice(Math.max(0, offset - 15), offset).trim();
                const after = string.slice(offset + match.length, offset + match.length + 15).trim();
                
                // Hindari range waktu (misal 08:00 - 21:00)
                const isTimeRange = /\d{2}[:\.]\d{2}$/.test(before) && /^\d{2}[:\.]\d{2}/.test(after);
                // Hindari range hari (misal Senin - Minggu)
                const dayNames = /senin|selasa|rabu|kamis|jumat|sabtu|minggu/i;
                const isDayRange = dayNames.test(before) && dayNames.test(after);
                
                if (isTimeRange || isDayRange) {
                    return match;
                }
                
                // Hindari duplikasi jika sebelumnya sudah ada tag <br>
                if (before.endsWith('<br>') || before.endsWith('<br/>') || before.endsWith('<br />')) {
                    return ' - ';
                }
                
                return '<br>- ';
            });
        }

        // Modifikasi respon untuk menyisipkan tombol WhatsApp secara dinamis jika AI menyarankan reservasi
        const lowerReply = aiReply.toLowerCase();
        if (lowerReply.includes("reservasi") || lowerReply.includes("booking") || lowerReply.includes("wa.me") || lowerReply.includes("hubungi whatsapp")) {
            const waButtonHtml = `
                <br>
                <a href="https://wa.me/628157092463?text=Halo%20Imar%20Salon,%20saya%20ingin%20melakukan%20reservasi..." target="_blank" class="assistant-whatsapp-cta-bubble">
                    <svg viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.388 1.966 13.92 .941 11.99.94c-5.439 0-9.865 4.37-9.87 9.8-.001 1.748.463 3.456 1.343 4.966l-.993 3.626 3.73-.978zM16.51 14.88c-.28-.14-1.658-.818-1.916-.912-.258-.094-.446-.14-.633.14-.188.28-.727.912-.89 1.099-.163.188-.326.21-.606.07-.28-.14-1.182-.435-2.251-1.39-.83-.74-1.39-1.654-1.553-1.934-.163-.28-.018-.431.122-.571.125-.125.28-.326.42-.49.14-.163.188-.28.28-.467.094-.188.047-.35-.023-.49-.07-.14-.633-1.523-.867-2.087-.228-.548-.46-.474-.633-.483-.163-.008-.35-.01-.537-.01-.188 0-.49.07-.747.35-.258.28-.983.959-.983 2.339 0 1.38 1.004 2.71 1.144 2.897.14.188 1.977 3.019 4.79 4.23.67.288 1.192.46 1.6.592.673.214 1.285.184 1.768.111.539-.08 1.658-.677 1.89-1.332.233-.654.233-1.215.163-1.332-.07-.116-.258-.186-.538-.326z"/>
                    </svg>
                    Hubungi via WhatsApp
                </a>
            `;
            aiReply += waButtonHtml;
        }

        return aiReply;

    } catch (err) {
        console.error("Gagal melakukan fetch ke OpenRouter:", err);
        return `Maaf Kak, saat ini jaringan saya sedang sibuk. Silakan hubungi kami langsung via WhatsApp untuk pertanyaan darurat ya! 🌸`;
    }
}

// Jalankan inisialisasi saat DOM siap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectChatWidget);
} else {
    injectChatWidget();
}
