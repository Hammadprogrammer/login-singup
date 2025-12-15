// file: app/api/products/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Interface for POST payload to handle all actions
interface ProductPayload {
  action: 'create' | 'update' | 'delete'; 
  id?: string;                            
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  imageUrls?: string[];
  isPublished?: boolean;
}

// ------------------------------------
// 1, 3, 4. CRUD (POST) - Handle CREATE, UPDATE, DELETE
// ------------------------------------
export async function POST(request: Request) {
  try {
    const body: ProductPayload = await request.json();
    const { action, id, ...productData } = body;

    switch (action) {
      case 'create':
        // C - CREATE Logic
        if (!productData.name || !productData.price) {
          return NextResponse.json({ message: 'Name and Price are required for creation' }, { status: 400 });
        }
        // Ensure price and stock are treated as numbers
        const createData = {
             ...productData,
             price: Number(productData.price),
             stock: Number(productData.stock || 0),
        }
        const newProduct = await prisma.product.create({ data: createData as any });
        return NextResponse.json(newProduct, { status: 201 });

      case 'update':
        // U - UPDATE Logic
        if (!id) return NextResponse.json({ message: 'ID is required for update' }, { status: 400 });
        // Ensure price and stock are treated as numbers during update
        const updateData = {
            ...productData,
            price: productData.price !== undefined ? Number(productData.price) : undefined,
            stock: productData.stock !== undefined ? Number(productData.stock) : undefined,
        }
        const updatedProduct = await prisma.product.update({
          where: { id },
          data: updateData as any,
        });
        return NextResponse.json(updatedProduct, { status: 200 });

      case 'delete':
        // D - DELETE Logic
        if (!id) return NextResponse.json({ message: 'ID is required for deletion' }, { status: 400 });
        await prisma.product.delete({ where: { id } });
        return new NextResponse(null, { status: 204 }); 

      default:
        return NextResponse.json({ message: 'Invalid action specified' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Error in single file API:', error);
    if (error.code === 'P2002') return NextResponse.json({ message: 'Product name already exists.' }, { status: 409 });
    if (error.code === 'P2025') return NextResponse.json({ message: 'Record not found.' }, { status: 404 });
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// ------------------------------------
// 2. READ (GET) - Get all products
// ------------------------------------
export async function GET() {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching products.' }, { status: 500 });
  }
}