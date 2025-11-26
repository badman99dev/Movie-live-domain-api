// Universal Movie Domain Finder API
// By Badal & Gemini 😜

export default async function handler(req, res) {
    // 1. Headers set karo taaki koi rok na sake
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cache-Control', 'no-store'); // Live data chahiye, cache nahi

    // 2. Query param se "site" ka naam uthao (e.g., ?site=hdhub)
    const { site } = req.query;

    if (!site) {
        return res.status(400).json({
            status: "error",
            message: "Naam to bata bhai? Example: /api?site=hdhub"
        });
    }

    try {
        let result = {};

        // 3. MASTER SWITCH BOARD - Yahan naye sites add honge
        switch (site.toLowerCase()) {
            
            case 'hdhub':
            case 'hdhub4u':
                result = await fetchHDHub();
                break;

            case 'vega':
            case 'vegamovies':
                // Vega ka usually permanent domain hota hai jo redirect karta hai
                // Example: vegamovies.rs ya vegamovies.pages.dev
                // Filhal ek example URL daal raha hu, tum future me change kar sakte ho
                result = await followRedirect("https://vegamovies.rs");
                break;

            case 'filmyzilla':
                // Filmyzilla ka permanent adda (Change if needed)
                result = await followRedirect("https://filmyzilla.com.in");
                break;
            
            case 'modiji': // Just for fun example
                result = { message: "Mitron! Domain dhoond rahe ho?" };
                break;

            default:
                throw new Error("Ye wali site list me nahi hai boss! Code edit karke add kar lo.");
        }

        // Final Response
        res.status(200).json({
            status: "success",
            site_requested: site,
            ...result
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
}

// ==========================================
// WORKER FUNCTIONS (Ye asli kaam karte hain)
// ==========================================

// 1. HDHub4u Logic (Advanced API Call)
async function fetchHDHub() {
    const d = new Date();
    // Wahi time based formula
    const seed = (d.getFullYear() * 1000000) + ((d.getMonth() + 1) * 10000) + (d.getDate() * 100) + d.getHours() + 1;
    
    const response = await fetch(`https://cdn.hub4u.cloud/host/?v=${seed}`, {
        headers: { "Referer": "https://hdhub4u.gd/" }
    });
    
    const data = await response.json();
    const liveLink = data.c ? atob(data.c) : null;
    
    // Domain saaf karke nikalte hain
    let cleanHost = "Unknown";
    if (liveLink) {
        try { cleanHost = new URL(liveLink).hostname; } catch(e){}
    }

    return {
        method: "API_HACK",
        current_domain: cleanHost,
        full_url: liveLink
    };
}

// 2. Generic Redirect Follower (Vega, Filmyzilla etc ke liye)
// Ye function bas URL ko hit karta hai aur dekhta hai kahan land hua
async function followRedirect(targetUrl) {
    try {
        const response = await fetch(targetUrl, {
            redirect: 'follow', // Important: Redirect follow karega
            method: 'HEAD',     // Sirf header mangwayenge, data nahi (Fast hota hai)
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const finalUrl = response.url; // Jahan pahunche wo URL
        const cleanHost = new URL(finalUrl).hostname;

        return {
            method: "REDIRECT_TRACE",
            input_url: targetUrl,
            current_domain: cleanHost,
            full_url: finalUrl
        };
    } catch (e) {
        return { error: "Site down hai ya URL galat hai." };
    }
}

// 3. HTML Scraper (Future ke liye - Agar koi site redirect nahi karti par link text me deti hai)
async function scrapeLink(targetUrl, regexPattern) {
    // Ye future me use karna agar zarurat pade
    // Example: Kisi page par "Click Here" ka link dhoondna
    return { message: "Logic not implemented yet" };
}
