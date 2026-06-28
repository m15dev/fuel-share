// ==========================================
// FUEL-SHARE™ - SUPABASE DATABASE HANDLER
// ==========================================

const supabaseUrl = "https://mupgkzqmihmlfgrvrome.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cGdrenFtaWhtbGZncnZyb21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDY4MDMsImV4cCI6MjA5ODA4MjgwM30.zaLtYys9EP3ZAqZHljiB5rfXNi2_i8wdKUv2URWR16c";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
window.supabaseClient = supabaseClient;

console.log("🚀 Supabase Inicializado com Sucesso!");

function gerarUUIDAleatorio() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function salvarPrecoCombustivel(stationId, tipoCombustivel, valorPreco) {
    console.log(`📡 Enviando preço para o posto UUID: ${stationId}`);
    
    try {
        const { data, error } = await supabaseClient
            .from('reports')
            .insert([
                {
                    station_id: stationId,                
                    fuel_type: parseInt(tipoCombustivel), 
                    price: parseFloat(valorPreco),        
                    payment_method: 1,                   
                    status: 1                            
                }
            ])
            .select();

        if (error) throw error;

        console.log("Preço salvo com sucesso! 🎉 Data de retorno:", data);
        return data;

    } catch (error) {
        console.error("🛑 Resposta do Supabase:", error.message);
    }
}

// ===============================================
// FUEL-SHARE™ FUEL-SHARE™ FUEL-SHARE™ FUEL-SHARE™ 
// ===============================================

// 4. TESTE F
const idDoMeuPostoReal = "15803d23-58c7-468d-a861-16e5a7a82255";
salvarPrecoCombustivel(idDoMeuPostoReal, 1, 5.89);