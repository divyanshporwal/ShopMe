import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Product from '@/models/product.model'
import { getAuthUser } from '@/middleware/auth'

export async function PATCH(request, { params }) {
  try {
    await connectDB()

    let user;
    try {
      user = await getAuthUser()
    } catch (err) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!user?._id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get product ID from URL params (unwrap/await params)
    const { id: productId } = await params
    console.log('[STOCK UPDATE] productId:', productId)
    console.log('[STOCK UPDATE] userId:', user._id)

    // Parse request body
    const body = await request.json()
    const { delta, quantity } = body
    console.log('[STOCK UPDATE] body:', body)

    // Find product — no merchant check yet
    const product = await Product.findById(productId)
    console.log('[STOCK UPDATE] product found:', !!product)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found', productId },
        { status: 404 }
      )
    }

    // Verify merchant owns this product
    const merchantField = product.merchantId
                       || product.merchant
                       || product.sellerId
                       || product.userId
                       || product.owner

    if (merchantField?.toString() !== user._id?.toString()) {
      return NextResponse.json(
        { error: 'Forbidden — not your product' },
        { status: 403 }
      )
    }

    // Calculate new quantity
    let newQty

    // Check both product.stock and product.quantity just in case
    const currentQty = product.stock !== undefined ? product.stock : 0

    if (typeof delta === 'number') {
      // Increment/decrement mode
      newQty = Math.max(0, currentQty + delta)
    } else if (typeof quantity === 'number') {
      // Set absolute value mode
      newQty = Math.max(0, quantity)
    } else {
      return NextResponse.json(
        { error: 'Provide delta or quantity in request body' },
        { status: 400 }
      )
    }

    // Update product quantity / stock
    const updated = await Product.findByIdAndUpdate(
      productId,
      { $set: { stock: newQty } },
      { new: true }
    )

    console.log('[STOCK UPDATE] new quantity:', newQty)

    return NextResponse.json({
      success: true,
      quantity: newQty,
      productId,
      message: `Stock updated to ${newQty}`,
    })

  } catch (error) {
    console.error('[STOCK UPDATE] error:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
