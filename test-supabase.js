import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key) {
        envVars[key.trim()] = rest.join('=').trim();
    }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log("Testing fetch...");
    const { data: fetch, error: fetchErr } = await supabase.from('menu_items').select('*');
    if (fetchErr) {
        console.error("Fetch Error:", fetchErr);
    } else {
        console.log("Fetched items count:", fetch.length);
    }

    console.log("Testing insert...");
    const testItem = {
        id: Date.now(),
        name: "Test Item",
        category: "Starters",
        price: 99,
        description: "Test",
        image: "https://test.com/test.jpg",
        popular: false
    };

    const { error: insertErr } = await supabase.from('menu_items').insert([testItem]);
    if (insertErr) {
        console.error("Insert Error:", insertErr);
    } else {
        console.log("Insert Success!");
        // cleanup
        await supabase.from('menu_items').delete().eq('id', testItem.id);
        console.log("Cleanup Success!");
    }
}
test();
