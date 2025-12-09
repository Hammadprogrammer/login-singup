import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '@/lib/prisma'; 

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: Upload function (no change)
async function uploadImageToCloudinary(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64String = buffer.toString('base64');
  const result = await cloudinary.uploader.upload(`data:${file.type};base64,${base64String}`, {
    folder: 'home_sliders', 
  });
  return result.secure_url;
}

// Helper: Get Public ID from URL (no change)
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
    const sliders = await prisma.homeSlider.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(sliders, { status: 200 });
  } catch (error) {
    console.error('READ_ERROR:', error);
    return NextResponse.json({ message: 'Failed to fetch sliders' }, { status: 500 });
  }
}

// ===================================
// 2. POST (CREATE) 
// ===================================
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[]; 

    if (!files || files.length === 0) {
        return NextResponse.json({ message: 'At least one image file is required' }, { status: 400 });
    }
    
    const imageUrls: string[] = [];
    for (const file of files) {
        if (file instanceof File) {
            const url = await uploadImageToCloudinary(file);
            imageUrls.push(url);
        }
    }

    const newSlider = await prisma.homeSlider.create({
      data: { images: imageUrls },
    });

    return NextResponse.json(newSlider, { status: 201 });

  } catch (error) {
    console.error('CREATE_ERROR:', error);
    return NextResponse.json({ message: 'Failed to create slider item' }, { status: 500 });
  }
}

// ===================================
// 3. PUT (UPDATE) - Handles FormData and JSON
// ===================================
export async function PUT(req: NextRequest) {
    const contentType = req.headers.get('content-type');
    let id: number;
    let newImageUrls: string[] = [];
    let existingImageUrls: string[] = [];

    try {
        if (contentType && contentType.includes('multipart/form-data')) {
            // Case 1: FormData (New Files Upload)
            const formData = await req.formData();
            
            // Get data from form fields
            id = parseInt(formData.get('id') as string);
            
            // Get existing URLs (sent as a comma-separated string)
            const existingUrlsString = formData.get('existingImages') as string;
            existingImageUrls = existingUrlsString ? existingUrlsString.split(',').filter(url => url.trim() !== '') : [];

            // Upload new files
            const files = formData.getAll('newImages') as File[];
            for (const file of files) {
                if (file instanceof File && file.size > 0) {
                    const url = await uploadImageToCloudinary(file);
                    newImageUrls.push(url);
                }
            }

            // Combine existing and newly uploaded URLs
            const finalImageUrls = [...existingImageUrls, ...newImageUrls];
            
            if (finalImageUrls.length === 0) {
                 return NextResponse.json({ message: 'At least one image URL is required after update' }, { status: 400 });
            }

            const updatedSlider = await prisma.homeSlider.update({
                where: { id: id },
                data: { images: finalImageUrls }, 
            });
            return NextResponse.json(updatedSlider, { status: 200 });

        } else {
            // Case 2: JSON (URL Reordering/Removal Only)
            const body = await req.json();
            id = parseInt(body.id);
            existingImageUrls = body.images;

            if (!id || !Array.isArray(existingImageUrls)) {
                return NextResponse.json({ message: 'ID and Images array required' }, { status: 400 });
            }

            const updatedSlider = await prisma.homeSlider.update({
                where: { id: id },
                data: { images: existingImageUrls }, 
            });
            return NextResponse.json(updatedSlider, { status: 200 });
        }

    } catch (error) {
        console.error('PUT_ERROR:', error);
        return NextResponse.json({ message: 'Failed to update slider item' }, { status: 500 });
    }
}


// ===================================
// 4. DELETE (DELETE) - ID Fix and Cloudinary Deletion
// ===================================
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json(); 
    if (!id) {
        return NextResponse.json({ message: 'ID missing for deletion' }, { status: 400 });
    }

    const numericId = parseInt(id); 

    const sliderToDelete = await prisma.homeSlider.findUnique({
        where: { id: numericId }
    });

    if (!sliderToDelete) {
        return NextResponse.json({ message: 'Slider not found' }, { status: 404 });
    }

    // Cloudinary Se Images Delete Karein
    const publicIds = sliderToDelete.images
      .map(url => getPublicIdFromUrl(url))
      .filter(id => id !== null) as string[];

    if (publicIds.length > 0) {
        await cloudinary.api.delete_resources(publicIds);
    }

    // Database record delete karein
    await prisma.homeSlider.delete({
      where: { id: numericId },
    });

    return NextResponse.json({ message: 'Slider successfully deleted' }, { status: 200 });
  } catch (error) {
    console.error('DELETE_ERROR:', error);
    return NextResponse.json({ message: 'Failed to delete slider item' }, { status: 500 });
  }
}