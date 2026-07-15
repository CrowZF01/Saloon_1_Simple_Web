<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar Harga & Layanan - Imar Saloon</title>
    <!-- Main page styles for header/footer consistency -->
    <link rel="stylesheet" href="../css/mainPage.css">
    <!-- Pricing page custom styles -->
    <link rel="stylesheet" href="../css/pricingPage.css">
</head>

<body>
    <header>
        <div class="logo-imar">
            <a href="../php/aboutPage.php">
                <img src="../assets/logo_imar.png" alt="Logo Imar Saloon">
            </a>
        </div>

        <nav class="links">
            <p>Imar Saloon</p>
            <a href="../php/mainPage.php">Beranda</a>
            <a href="../php/pricingPage.php" class="active">Daftar Harga</a>
            <a href="../php/reviewPage.php">Ulasan</a>
            <a href="../php/aboutPage.php">Tentang Kami</a>
        </nav>
    </header>

    <main class="pricing-page-main">
        <!-- Hero Section -->
        <section class="pricing-hero">
            <div class="section-header">
                <span class="sub-title">Layanan Terbaik Kami</span>
                <h2>Daftar Harga</h2>
                <div class="divider"></div>
                <p class="pricing-intro">Kami berkomitmen untuk memancarkan kecantikan dan kepercayaan diri Anda. Berikut adalah menu layanan lengkap dari Imar Saloon.</p>
            </div>
        </section>

        <!-- Luxury Menu Card (Image) -->
        <section class="pricing-menu-container">
            <div class="menu-image-wrapper">
                <img src="../assets/imar_saloon_pricelist_final_fixed.pdf.jpg" alt="Daftar Harga Imar Saloon" class="pricing-menu-image">
            </div>

            <!-- WhatsApp CTA Area -->
            <div class="pricing-cta">
                <p>Ingin melakukan reservasi atau berkonsultasi mengenai layanan kami?</p>
                <a href="https://wa.me/628157092463?text=Halo%20Imar%20Saloon,%20saya%20ingin%20bertanya%20tentang%20layanan..." target="_blank" class="btn-whatsapp">
                    <svg viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.388 1.966 13.92 .941 11.99.94c-5.439 0-9.865 4.37-9.87 9.8-.001 1.748.463 3.456 1.343 4.966l-.993 3.626 3.73-.978zM16.51 14.88c-.28-.14-1.658-.818-1.916-.912-.258-.094-.446-.14-.633.14-.188.28-.727.912-.89 1.099-.163.188-.326.21-.606.07-.28-.14-1.182-.435-2.251-1.39-.83-.74-1.39-1.654-1.553-1.934-.163-.28-.018-.431.122-.571.125-.125.28-.326.42-.49.14-.163.188-.28.28-.467.094-.188.047-.35-.023-.49-.07-.14-.633-1.523-.867-2.087-.228-.548-.46-.474-.633-.483-.163-.008-.35-.01-.537-.01-.188 0-.49.07-.747.35-.258.28-.983.959-.983 2.339 0 1.38 1.004 2.71 1.144 2.897.14.188 1.977 3.019 4.79 4.23.67.288 1.192.46 1.6.592.673.214 1.285.184 1.768.111.539-.08 1.658-.677 1.89-1.332.233-.654.233-1.215.163-1.332-.07-.116-.258-.186-.538-.326z"/>
                    </svg>
                    Hubungi via WhatsApp
                </a>
            </div>
        </section>
    </main>

    <footer>
        <div class="footer-container">
            <!-- Brand Column -->
            <div class="footer-col brand-col">
                <div class="footer-logo">
                    <img src="../assets/logo_imar.png" alt="Logo Imar Saloon">
                </div>
            </div>

            <!-- Quick Links Column -->
            <div class="footer-col links-col">
                <h3>Jelajahi</h3>
                <ul>
                    <li><a href="../php/mainPage.php">Beranda</a></li>
                    <li><a href="../php/pricingPage.php">Daftar Harga</a></li>
                    <li><a href="../php/reviewPage.php">Ulasan</a></li>
                    <li><a href="../php/aboutPage.php">Tentang Kami</a></li>
                </ul>
            </div>

            <!-- Salon Hours Column -->
            <div class="footer-col hours-col">
                <h3>Jam Buka</h3>
                <ul>
                    <li><span>Senin - Minggu</span><span class="hours-time">08:00 - 21:00</span></li>
                </ul>
            </div>

            <!-- Contact Column -->
            <div class="footer-col contact-col">
                <h3>Info Kontak</h3>
                <p class="contact-item">📍 JL. Demakan no 94, Daerah Istimewa Yogyakarta (DIY), Indonesia</p>
                <p class="contact-item">📞 +62 815-7092-463 <span style="font-size: 12px; color: #888;">(WhatsApp Message Only)</span></p>
            </div>
        </div>

        <div class="footer-bottom">
            <p>&copy; 2026 Imar Saloon. Hak Cipta Dilindungi.</p>
        </div>
    </footer>
</body>

</html>
