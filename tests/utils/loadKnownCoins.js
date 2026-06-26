/**
 * Known crypto list from last successful discovery (available_coins.json).
 */

import fs from 'fs';
import path from 'path';

const COINS_FILE = path.join(process.cwd(), 'available_coins.json');

const FIAT = new Set(['USD', 'USDT', 'USDC']);
const NON_COINS = new Set(['FAQ', 'HELP', 'P2P', 'AI', 'ASK', 'DASH', 'HOME', 'NEW']);

export function loadKnownCoins() {
    try {
        if (!fs.existsSync(COINS_FILE)) return [];
        const raw = JSON.parse(fs.readFileSync(COINS_FILE, 'utf8'));
        return (Array.isArray(raw) ? raw : [])
            .map((c) => String(c).trim().split(/\s+/)[0])
            .filter((c) => c && !FIAT.has(c) && !NON_COINS.has(c.toUpperCase()));
    } catch {
        return [];
    }
}

export function mergeCoinLists(...lists) {
    const seen = new Set();
    const out = [];
    for (const list of lists) {
        for (const coin of list || []) {
            const key = String(coin).trim().toUpperCase();
            if (!key || FIAT.has(key) || NON_COINS.has(key) || seen.has(key)) continue;
            seen.add(key);
            out.push(String(coin).trim().split(/\s+/)[0]);
        }
    }
    return out;
}
