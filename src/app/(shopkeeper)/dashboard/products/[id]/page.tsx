import ProductForm from '@/components/ProductForm'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const supabase = createClient()

    const { data: product } = await (await supabase)
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

    if (!product) {
        notFound()
    }

    return <ProductForm initialData={product} />
}
