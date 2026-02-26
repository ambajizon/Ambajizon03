const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://hwnipxzdkjeeeinidvec.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3bmlweHpka2plZWVpbmlkdmVjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTM5ODU2OSwiZXhwIjoyMDg2OTc0NTY5fQ.Id0t8v-EdERN6OkDpbG-ak2ctuCvjCX3bNBlVK3c_5A');

const sql = `
CREATE OR REPLACE FUNCTION get_crm_customers(p_store_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  mobile text,
  email text,
  tag text,
  total_orders bigint,
  total_spent numeric,
  last_order_date timestamp with time zone
)
LANGUAGE sql
AS $$
  SELECT 
    c.id,
    c.full_name,
    c.mobile,
    c.email,
    c.tag,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    MAX(o.created_at) as last_order_date
  FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.id
  WHERE c.store_id = p_store_id
  GROUP BY c.id;
$$;
`;

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { sql_string: sql });
  if (error) {
    console.error("RPC exec_sql error. Trying to see if it even exists...", error);
  } else {
    console.log("Success executing SQL", data);
  }
}
run();
