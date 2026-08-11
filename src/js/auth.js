// ==========================================
// FUEL-SHARE™ - AUTHENTICATION HANDLER 
// ==========================================

import { supabaseClient } from './database.js';

export async function loginUser(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        throw error;
        alert("Please, Login With and valid account, and try again.");
    }
    return data.user;
}

export async function getCurrentUser() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    return user;
}

export async function logoutUser() {
    await supabaseClient.auth.signOut();
}