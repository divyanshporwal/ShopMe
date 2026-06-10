import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Product from '@/models/product.model'

export async function GET(request) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const q     = searchParams.get('q')?.trim()
    const limit = parseInt(searchParams.get('limit')) || 6

    if (!q || q.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Search by title, category, brand
    const products = await Product.find({
      $or: [
        { title:    { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { brand:    { $regex: q, $options: 'i' } },
      ],
      // Only show in-stock products in suggestions
      stock: { $gt: 0 },
    })
    .select('_id title category brand price images')
    .limit(limit)
    .lean()

    const suggestions = products.map(p => ({
      _id: p._id,
      name: p.title,
      category: p.category,
      brand: p.brand,
      price: p.price,
      image: p.images?.[0] || ''
    }))

    return NextResponse.json({ suggestions })

  } catch (error) {
    console.error('Search suggestions error:', error)
    return NextResponse.json(
      { suggestions: [], error: error.message },
      { status: 500 }
    )
  }
}
