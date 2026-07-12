// ==========================================
// FUEL-SHARE™ - SUPABASE DATABASE HANDLER 
// ==========================================

const supabaseUrl = "https://mupgkzqmihmlfgrvrome.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11cGdrenFtaWhtbGZncnZyb21lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDY4MDMsImV4cCI6MjA5ODA4MjgwM30.zaLtYys9EP3ZAqZHljiB5rfXNi2_i8wdKUv2URWR16c";

export const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);