// file: app/api/products/route.ts - UPDATED for Server-Side File Upload

import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '@/lib/prisma'; 

// --- Cloudinary Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: Upload function (Save to 'products_ecommerce' folder)
async function uploadProductImageToCloudinary(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64String = buffer.toString('base64');
  const result = await cloudinary.uploader.upload(`data:${file.type};base64,${base64String}`, {
    folder: 'products_ecommerce', // 🛑 Saves to the Product folder
  });
  return result.secure_url;
}

// Helper: Get Public ID from URL (Includes folder path, e.g., 'products_ecommerce/...')
function getPublicIdFromUrl(url: string): string | null {
    const parts = url.split('/');
    const folderAndId = parts.slice(-2).join('/').split('.');
    if (folderAndId.length > 0) {
        return folderAndId[0];
    }
    return null;
}

// ===================================
// 1. GET (READ ALL) 
// ===================================
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('READ_ERROR:', error);
    return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
  }
}

// ===================================
// 2. POST (CREATE) - Handles FormData for File Upload
// ===================================
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];
    
    // Extract non-file data
    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const stock = parseInt(formData.get('stock') as string);
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const isPublished = formData.get('isPublished') === 'true';

    if (!name || isNaN(price) || files.length === 0) {
        return NextResponse.json({ message: 'Name, Price, and at least one Image are required' }, { status: 400 });
    }
    
    const imageUrls: string[] = [];
    for (const file of files) {
        if (file instanceof File && file.size > 0) {
            const url = await uploadProductImageToCloudinary(file); // 🛑 Server-side upload to folder
            imageUrls.push(url);
        }
    }

    if (imageUrls.length === 0) {
        return NextResponse.json({ message: 'No valid images uploaded' }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: { 
        name,
        price,
        stock: isNaN(stock) ? 0 : stock,
        category,
        description,
        isPublished,
        imageUrls, // Save URLs from Cloudinary
      },
    });

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error: any) {
    console.error('CREATE_ERROR:', error);
    if (error.code === 'P2002') return NextResponse.json({ message: 'Product name already exists.' }, { status: 409 });
    return NextResponse.json({ message: 'Failed to create product item', error: error.message }, { status: 500 });
  }
}

// ===================================
// 3. PUT (UPDATE) - Handles FormData (Files) and JSON (Reorder/Data)
// ===================================
export async function PUT(req: NextRequest) {
    const contentType = req.headers.get('content-type');
    let id: string;
    
    try {
        if (contentType && contentType.includes('multipart/form-data')) {
            // Case 1: FormData (Data + New Files Upload)
            const formData = await req.formData();
            
            // Get data from form fields
            id = formData.get('id') as string;
            const name = formData.get('name') as string;
            const price = parseFloat(formData.get('price') as string);
            const stock = parseInt(formData.get('stock') as string);
            const category = formData.get('category') as string;
            const description = formData.get('description') as string;
            const isPublished = formData.get('isPublished') === 'true';
            
            // Get existing URLs
            const existingUrlsString = formData.get('existingImageUrls') as string;
            const existingImageUrls = existingUrlsString ? existingUrlsString.split(',').filter(url => url.trim() !== '') : [];

            // Upload new files
            const files = formData.getAll('newImages') as File[];
            const newImageUrls: string[] = [];
            for (const file of files) {
                if (file instanceof File && file.size > 0) {
                    const url = await uploadProductImageToCloudinary(file); // 🛑 Server-side upload to folder
                    newImageUrls.push(url);
                }
            }

            // Combine existing and newly uploaded URLs
            const finalImageUrls = [...existingImageUrls, ...newImageUrls];
            
            if (finalImageUrls.length === 0) {
                 return NextResponse.json({ message: 'At least one image URL is required after update' }, { status: 400 });
            }

            const updatedProduct = await prisma.product.update({
                where: { id: id },
                data: { 
                    name,
                    price,
                    stock: isNaN(stock) ? 0 : stock,
                    category,
                    description,
                    isPublished,
                    imageUrls: finalImageUrls, 
                }, 
            });
            return NextResponse.json(updatedProduct, { status: 200 });

        } else {
            // Case 2: JSON (URL Reordering/Data Update Only - No Files)
            const body = await req.json();
            id = body.id;
            const { imageUrls, ...dataToUpdate } = body; 

            if (!id) {
                return NextResponse.json({ message: 'ID is required for update' }, { status: 400 });
            }
            
            const updateData: any = { ...dataToUpdate };
            if (imageUrls) updateData.imageUrls = imageUrls;
            if (dataToUpdate.price !== undefined) updateData.price = Number(dataToUpdate.price);
            if (dataToUpdate.stock !== undefined) updateData.stock = Number(dataToUpdate.stock);


            const updatedProduct = await prisma.product.update({
                where: { id: id },
                data: updateData, 
            });
            return NextResponse.json(updatedProduct, { status: 200 });
        }

    } catch (error: any) {
        console.error('PUT_ERROR:', error);
        if (error.code === 'P2025') return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
        return NextResponse.json({ message: 'Failed to update product item', error: error.message }, { status: 500 });
    }
}


// ===================================
// 4. DELETE (DELETE) - Cleanup and DB Deletion
// ===================================
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json(); 
    if (!id) {
        return NextResponse.json({ message: 'ID missing for deletion' }, { status: 400 });
    }

    const productToDelete = await prisma.product.findUnique({
        where: { id }
    });

    if (!productToDelete) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Cloudinary Se Images Delete Karein (Uses folder path for public ID)
    const publicIds = productToDelete.imageUrls
      .map(url => getPublicIdFromUrl(url))
      .filter(id => id !== null) as string[];

    if (publicIds.length > 0) {
        // Non-fatal error handling for deletion is done within the helper, but log here too
        await cloudinary.api.delete_resources(publicIds);
    }

    // Database record delete karein
    await prisma.product.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('DELETE_ERROR:', error);
    if (error.code === 'P2025') return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    return NextResponse.json({ message: 'Failed to delete product item', error: error.message }, { status: 500 });
  }
}