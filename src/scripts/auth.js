// auth.js

import { API_URL } from "./config.js";
import { getCookie, setCookie, deleteCookie } from "./utils.js";

export async function getUserInfo() {
    const token = getCookie("access_token");
    if (!token) return null;

    try {
        const resp = await fetch(`${API_URL}/autenticar`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!resp.ok) return null;

        return await resp.json();
    } catch {
        return null;
    }
}

export function logout() {
    deleteCookie("access_token");
    deleteCookie("refresh_token");
}

