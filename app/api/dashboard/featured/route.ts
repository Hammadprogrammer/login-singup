import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminUser } from '@/lib/auth';

// GET
//  - default (public): featured products only
//  - ?all=1 (admin): every product with its isFeatured flag for management
export async function GET(req: NextRequest) {
  try {
    const all = req.nextUrl.searchParams.get('all');

    if (all) {
      if (!(await getAdminUser())) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
      const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, price: true, imageUrls: true, isFeatured: true, isPublished: true },
      });
      return NextResponse.json(products, { status: 200 });
    }

    const featured = await prisma.product.findMany({
      where: { isFeatured: true },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, price: true, imageUrls: true, brands: true },
    });
    return NextResponse.json(featured, { status: 200 });
  } catch (error) {
    console.error('FEATURED_READ_ERROR:', error);
    return NextResponse.json(
      { message: 'Failed to fetch', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// PUT { id, isFeatured } -> toggle a product's featured flag
export async function PUT(req: NextRequest) {
  try {
    if (!(await getAdminUser())) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    const { id, isFeatured } = await req.json();
    if (!id) return NextResponse.json({ message: 'Product id required' }, { status: 400 });

    const updated = await prisma.product.update({
      where: { id: String(id) },
      data: { isFeatured: Boolean(isFeatured) },
      select: { id: true, isFeatured: true },
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('FEATURED_UPDATE_ERROR:', error);
    return NextResponse.json(
      { message: 'Failed to update', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
