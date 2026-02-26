const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://hwnipxzdkjeeeinidvec.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bmlweHpka2plZWVpbmlkdmVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTM5ODU2OSwiZXhwIjoyMDg2OTc0NTY5fQ.Id0t8v-EdERN6OkDpbG-ak2ctuCvjCX3bNBlVK3c_5A');

async function checkCols() {
    const { data, error } = await supabase.from('stores').select('custom_domain, is_live').limit(1);
    if (error) {
        console.error("Column check failed:", error.message);
    } else {
        console.log("Columns EXIST!", data);
    }
}
checkCols();
