import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '@/lib/prisma';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64String = buffer.toString('base64');
  const result = await cloudinary.uploader.upload(
    `data:${file.type};base64,${base64String}`,
    { folder: 'ladies_ecommerce_v2' }
  );
  return result.secure_url;
}

// GET ALL
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}

// POST: CREATE
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Handle Images
    const files = formData.getAll('images') as File[];
    const imageUrls = await Promise.all(
      files.filter(f => f.size > 0).map(f => uploadToCloudinary(f))
    );

    const product = await prisma.product.create({
      data: {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        saleType: formData.get('saleType') as any,
        condition: formData.get('condition') as any,
        categories: formData.get('cat')?.toString().split(',').filter(Boolean) || [],
        subCategories: formData.get('subCat')?.toString().split(',').filter(Boolean) || [],
        brands: formData.get('brand')?.toString().split(',').filter(Boolean) || [],
        sizes: formData.get('sizes')?.toString().split(',').filter(Boolean) || [],
        colors: formData.get('colors')?.toString().split(',').filter(Boolean) || [],
        imageUrls,
        isPublished: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: UPDATE
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = formData.get('id') as string;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Handle New Images
    const newFiles = formData.getAll('newImages') as File[];
    const newUploadedUrls = await Promise.all(
      newFiles.filter(f => f.size > 0).map(f => uploadToCloudinary(f))
    );

    // Keep existing images that weren't deleted in UI
    const remainingImages = formData.get('imageUrls')?.toString().split(',').filter(Boolean) || [];
    const finalImages = [...remainingImages, ...newUploadedUrls];

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: parseFloat(formData.get('price') as string),
        saleType: formData.get('saleType') as any,
        condition: formData.get('condition') as any,
        categories: formData.get('cat')?.toString().split(',').filter(Boolean) || [],
        subCategories: formData.get('subCat')?.toString().split(',').filter(Boolean) || [],
        brands: formData.get('brand')?.toString().split(',').filter(Boolean) || [],
        sizes: formData.get('sizes')?.toString().split(',').filter(Boolean) || [],
        colors: formData.get('colors')?.toString().split(',').filter(Boolean) || [],
        imageUrls: finalImages,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}