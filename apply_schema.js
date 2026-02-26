const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://hwnipxzdkjeeeinidvec.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bmlweHpka2plZWVpbmlkdmVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTM5ODU2OSwiZXhwIjoyMDg2OTc0NTY5fQ.Id0t8v-EdERN6OkDpbG-ak2ctuCvjCX3bNBlVK3c_5A');

const sql = `
  ALTER TABLE stores ADD COLUMN IF NOT EXISTS custom_domain text;
  ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_live boolean DEFAULT true;
`;

async function run() {
    const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
    if (error) {
        console.error("RPC exec_sql error:", error);
    } else {
        console.log("Success executing SQL", data);
    }
}
run();
