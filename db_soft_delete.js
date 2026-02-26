const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function addColumn() {
    const { error } = await supabase.rpc('execute_sql', {
        query: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS is_deleted boolean default false;'
    });
    if (error) console.log("Failed to run via RPC:", error.message);
    else console.log("Added column successfully via RPC!");
}
addColumn();
