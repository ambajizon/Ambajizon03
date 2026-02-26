require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function updateStock() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log('Updating stock for Wooden Elephant 2...');

    const { data: product, error: findError } = await supabase
        .from('products')
        .select('id, name, stock')
        .ilike('name', '%Wooden Elephant 2%')
        .single();

    if (findError) {
        console.log('Error finding product:', findError.message);
        return;
    }

    console.log(`Found product: ${product.name} (Current Stock: ${product.stock})`);

    const { error: updateError } = await supabase
        .from('products')
        .update({ stock: 50 })
        .eq('id', product.id);

    if (updateError) {
        console.log('Error updating stock:', updateError.message);
    } else {
        console.log('Stock updated to 50 successfully.');
    }
}

updateStock();
