require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixSlug() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get the store for rajesh
    const { data: store, error: findError } = await supabase
        .from('stores')
        .select('id, slug, name')
        .ilike('name', '%Rajesh%')
        .single();

    if (findError) {
        console.log('Find Error:', findError.message);
        return;
    }

    console.log('Found Store:', store.name, store.slug);

    // Update slug
    const { error: updateError } = await supabase
        .from('stores')
        .update({ slug: 'rajesh-handicrafts' })
        .eq('id', store.id);

    if (updateError) {
        console.log('Update Error:', updateError.message);
    } else {
        console.log('Slug fixed to: rajesh-handicrafts');
    }
}

fixSlug();
