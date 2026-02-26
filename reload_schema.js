require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function reload() {
    console.log("Reloading schema cache...");
    // Just executing this rpc triggers schema cache reload in recent Supabase setups, or we can just fetch to see if it fixes.
    // Actually, making a request to the table metadata forces it in some setups.
    // If not, we could alter the table slightly to force it. Let's just create and drop a dummy column.
    try {
        await supabase.rpc('exec_sql', { sql_string: `ALTER TABLE public.products ADD COLUMN dummy_col BOOLEAN;` });
        await supabase.rpc('exec_sql', { sql_string: `ALTER TABLE public.products DROP COLUMN dummy_col;` });
        console.log("Schema reload forced via DDL.");
    } catch (e) {
        console.log("DDL failed:", e.message);
    }
}
reload();
