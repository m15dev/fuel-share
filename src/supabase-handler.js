// ==========================================
// FUEL-SHARE™ - SUPABASE DATABASE HANDLER
// ==========================================

const supabaseUrl = "https://mupgkzqmihmlfgrvrome.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cGdrenFtaWhtbGZncnZyb21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDY4MDMsImV4cCI6MjA5ODA4MjgwM30.zaLtYys9EP3ZAqZHljiB5rfXNi2_i8wdKUv2URWR16c";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
window.supabaseClient = supabaseClient;

console.log("🚀 Supabase Initialized with Realtime support!");
console.log("reportPriceByName('Station Name', 9.99)");

window.loginUser = async function(email, password) {
    console.log("Tentando logar...");
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        console.error("🛑 Erro de login:", error.message);
    } else {
        console.log("✅ Logado com sucesso!", data.user.email);
        updateDashboard(); 
    }
};

// 1. CORE FUNCTION: SAVE PRICE
async function saveFuelPrice(stationId, fuelType, priceValue) {
    try {
        const { data, error } = await supabaseClient
            .from('reports')
            .insert([{
                station_id: stationId,                
                fuel_type: parseInt(fuelType), 
                price: parseFloat(priceValue),        
                payment_method: 1,                 
                status: 1                          
            }])
            .select();

        if (error) throw error;
        console.log("🎉 Price saved successfully!");
        return data;
    } catch (error) {
        console.error("🛑 Error saving:", error.message);
    }
}

// 2. SMART SHORTCUT: reportPriceByName('Station Name', 5.99)
async function reportPriceByName(stationName, priceValue) {
    const { data, error } = await supabaseClient
        .from('stations')
        .select('id')
        .ilike('name', `%${stationName}%`)
        .limit(1)
        .single();

    if (error || !data) {
        console.error("🛑 Station not found!");
        return;
    }

    await saveFuelPrice(data.id, 0, priceValue);
}
window.reportPriceByName = reportPriceByName;

// 3. UI UPDATE LOGIC
async function updateDashboard() {
    console.log("🔄 Updating dashboard...");

    // Get Recent
    const { data: recent } = await supabaseClient
        .from('reports')
        .select(`price, stations:station_id (name)`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    // Get Lowest
    const { data: lowest } = await supabaseClient
        .from('reports')
        .select(`price`)
        .order('price', { ascending: true })
        .limit(1)
        .single();

    if (recent) {
        const priceDisplay = document.querySelector('.fuel-recent');
        if (priceDisplay) priceDisplay.innerText = recent.price.toFixed(2).replace('.', ',');
        
        const stationDisplay = document.getElementById('low-price-local');
        if (stationDisplay) stationDisplay.innerText = `🚗 ${recent.stations.name}`;
    }

    if (lowest) {
        const lowDisplay = document.querySelector('.fuel-price');
        if (lowDisplay) lowDisplay.innerText = lowest.price.toFixed(2).replace('.', ',');
    }
}

// 4. REALTIME LISTENER (Magic happens here)
supabaseClient
  .channel('reports-channel')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, 
      (payload) => {
          console.log('⚡ Change detected, updating UI for everyone!');
          updateDashboard();
      }
  )
  .subscribe();

// Initial Load
updateDashboard();