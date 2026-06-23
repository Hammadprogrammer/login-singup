import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '@/lib/prisma';
import { getAdminUser } from '@/lib/auth';

const FORBIDDEN = NextResponse.json({ message: 'Forbidden' }, { status: 403 });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImageToCloudinary(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64String = buffer.toString('base64');
  const result = await cloudinary.uploader.upload(
    `data:${file.type};base64,${base64String}`,
    { folder: 'promo_banners' }
  );
  return result.secure_url;
}

function getPublicIdFromUrl(url: string): string | null {
  const parts = url.split('/');
  const folderAndId = parts.slice(-2).join('/').split('.');
  return folderAndId.length > 0 ? folderAndId[0] : null;
}

// GET ALL (public)
export async function GET() {
  try {
    const banners = await prisma.promoBanner.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
    return NextResponse.json(banners, { status: 200 });
  } catch (error) {
    console.error('PROMO_READ_ERROR:', error);
    return NextResponse.json(
      { message: 'Failed to fetch banners', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// CREATE
export async function POST(req: NextRequest) {
  try {
    if (!(await getAdminUser())) return FORBIDDEN;
    const formData = await req.formData();

    const title = (formData.get('title') as string)?.trim();
    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    const file = formData.get('image') as File | null;
    let imageUrl: string | null = null;
    if (file instanceof File && file.size > 0) {
      imageUrl = await uploadImageToCloudinary(file);
    }

    const banner = await prisma.promoBanner.create({
      data: {
        title,
        subtitle: (formData.get('subtitle') as string) || null,
        buttonText: (formData.get('buttonText') as string) || 'Shop now',
        link: (formData.get('link') as string) || '/',
        image: imageUrl,
        bgColor: (formData.get('bgColor') as string) || '#9a8478',
        size: (formData.get('size') as string) || 'normal',
        order: parseInt((formData.get('order') as string) || '0') || 0,
      },
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('PROMO_CREATE_ERROR:', error);
    return NextResponse.json(
      { message: 'Failed to create banner', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// UPDATE
export async function PUT(req: NextRequest) {
  try {
    if (!(await getAdminUser())) return FORBIDDEN;
    const formData = await req.formData();

    const id = parseInt(formData.get('id') as string);
    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    const existing = await prisma.promoBanner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ message: 'Banner not found' }, { status: 404 });
    }

    let imageUrl = existing.image;
    const file = formData.get('image') as File | null;
    if (file instanceof File && file.size > 0) {
      // Delete old image from cloudinary
      if (existing.image) {
        const publicId = getPublicIdFromUrl(existing.image);
        if (publicId) {
          try { await cloudinary.uploader.destroy(publicId); } catch {}
        }
      }
      imageUrl = await uploadImageToCloudinary(file);
    }

    const updated = await prisma.promoBanner.update({
      where: { id },
      data: {
        title: (formData.get('title') as string) || existing.title,
        subtitle: (formData.get('subtitle') as string) ?? existing.subtitle,
        buttonText: (formData.get('buttonText') as string) || existing.buttonText,
        link: (formData.get('link') as string) || existing.link,
        image: imageUrl,
        bgColor: (formData.get('bgColor') as string) || existing.bgColor,
        size: (formData.get('size') as string) || existing.size,
        order: parseInt((formData.get('order') as string) || `${existing.order}`) || existing.order,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PROMO_UPDATE_ERROR:', error);
    return NextResponse.json(
      { message: 'Failed to update banner', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  try {
    if (!(await getAdminUser())) return FORBIDDEN;
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ message: 'ID missing for deletion' }, { status: 400 });
    }

    const numericId = parseInt(id);
    const banner = await prisma.promoBanner.findUnique({ where: { id: numericId } });
    if (!banner) {
      return NextResponse.json({ message: 'Banner not found' }, { status: 404 });
    }

    if (banner.image) {
      const publicId = getPublicIdFromUrl(banner.image);
      if (publicId) {
        try { await cloudinary.uploader.destroy(publicId); } catch {}
      }
    }

    await prisma.promoBanner.delete({ where: { id: numericId } });
    return NextResponse.json({ message: 'Banner deleted' }, { status: 200 });
  } catch (error) {
    console.error('PROMO_DELETE_ERROR:', error);
    return NextResponse.json(
      { message: 'Failed to delete banner', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
