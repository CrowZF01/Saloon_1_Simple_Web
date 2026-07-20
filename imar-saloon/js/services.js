import { supabase } from '../connection/supabase.js'

async function loadServices() {
    const container = document.getElementById('services-grid')
    if (!container) return

    try {
        const { data: services, error } = await supabase
            .from('services')
            .select('*')
            .order('id', { ascending: true })

        if (error) {
            throw error
        }

        if (services && services.length > 0) {
            container.innerHTML = ''

            services.forEach(service => {
                const card = document.createElement('div')
                card.className = 'service-card'

                card.innerHTML = `
                    <div class="service-img-wrapper">
                        <img src="${service.image}" alt="${service.name}">
                    </div>
                    <h3>${service.name}</h3>
                    <p>${service.description}</p>
                    <a href="pages/pricingPage.html" class="service-link">Lihat Detail Harga</a>
                `
                container.appendChild(card)
            })
        }
    } catch (err) {
        console.error('Error loading services from Supabase:', err)
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadServices)
} else {
    loadServices()
}
