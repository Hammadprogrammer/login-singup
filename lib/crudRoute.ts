import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';
import prisma from '@/lib/prisma';
import { getAdminUser } from '@/lib/auth';

const FORBIDDEN = NextResponse.json({ message: 'Forbidden' }, { status: 403 });

export type FieldType = 'string' | 'int' | 'image';

export interface FieldDef {
  name: string;
  type: FieldType;
  default?: string | number;
}

async function uploadImage(file: File, folder: string): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await cloudinary.uploader.upload(
    `data:${file.type};base64,${buffer.toString('base64')}`,
    { folder }
  );
  return result.secure_url;
}

function getPublicId(url: string): string | null {
  const parts = url.split('/');
  const folderAndId = parts.slice(-2).join('/').split('.');
  return folderAndId.length > 0 ? folderAndId[0] : null;
}

function errBody(error: unknown) {
  return { error: error instanceof Error ? error.message : String(error) };
}

/**
 * Builds GET/POST/PUT/DELETE handlers for a simple single-table model
 * with optional image fields uploaded to Cloudinary.
 */
export function createCrud(
  modelName: string,
  fields: FieldDef[],
  folder: string
) {
  const model = () => (prisma as unknown as Record<string, any>)[modelName];
  const imageFields = fields.filter((f) => f.type === 'image').map((f) => f.name);

  async function parseFormData(formData: FormData, existing?: Record<string, any>) {
    const data: Record<string, any> = {};
    for (const f of fields) {
      if (f.type === 'image') {
        const file = formData.get(f.name) as File | null;
        if (file instanceof File && file.size > 0) {
          // delete old image when replacing
          if (existing?.[f.name]) {
            const pid = getPublicId(existing[f.name]);
            if (pid) { try { await cloudinary.uploader.destroy(pid); } catch {} }
          }
          data[f.name] = await uploadImage(file, folder);
        } else if (existing) {
          data[f.name] = existing[f.name];
        } else {
          data[f.name] = f.default ?? null;
        }
        continue;
      }

      const raw = formData.get(f.name);
      if (raw === null || raw === undefined) {
        if (existing) data[f.name] = existing[f.name];
        else if (f.default !== undefined) data[f.name] = f.type === 'int' ? Number(f.default) : f.default;
        continue;
      }
      if (f.type === 'int') {
        data[f.name] = parseInt(raw as string) || (existing?.[f.name] ?? 0);
      } else {
        data[f.name] = (raw as string) || existing?.[f.name] || (f.default ?? '');
      }
    }
    return data;
  }

  const GET = async () => {
    try {
      const rows = await model().findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
      return NextResponse.json(rows, { status: 200 });
    } catch (error) {
      console.error(`${modelName}_READ_ERROR:`, error);
      return NextResponse.json({ message: 'Failed to fetch', ...errBody(error) }, { status: 500 });
    }
  };

  const POST = async (req: NextRequest) => {
    try {
      if (!(await getAdminUser())) return FORBIDDEN;
      const formData = await req.formData();
      const data = await parseFormData(formData);
      const row = await model().create({ data });
      return NextResponse.json(row, { status: 201 });
    } catch (error) {
      console.error(`${modelName}_CREATE_ERROR:`, error);
      return NextResponse.json({ message: 'Failed to create', ...errBody(error) }, { status: 500 });
    }
  };

  const PUT = async (req: NextRequest) => {
    try {
      if (!(await getAdminUser())) return FORBIDDEN;
      const formData = await req.formData();
      const id = parseInt(formData.get('id') as string);
      if (!id) return NextResponse.json({ message: 'ID is required' }, { status: 400 });

      const existing = await model().findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ message: 'Not found' }, { status: 404 });

      const data = await parseFormData(formData, existing);
      const row = await model().update({ where: { id }, data });
      return NextResponse.json(row, { status: 200 });
    } catch (error) {
      console.error(`${modelName}_UPDATE_ERROR:`, error);
      return NextResponse.json({ message: 'Failed to update', ...errBody(error) }, { status: 500 });
    }
  };

  const DELETE = async (req: NextRequest) => {
    try {
      if (!(await getAdminUser())) return FORBIDDEN;
      const { id } = await req.json();
      if (!id) return NextResponse.json({ message: 'ID missing' }, { status: 400 });
      const numericId = parseInt(id);

      const existing = await model().findUnique({ where: { id: numericId } });
      if (!existing) return NextResponse.json({ message: 'Not found' }, { status: 404 });

      for (const fld of imageFields) {
        if (existing[fld]) {
          const pid = getPublicId(existing[fld]);
          if (pid) { try { await cloudinary.uploader.destroy(pid); } catch {} }
        }
      }

      await model().delete({ where: { id: numericId } });
      return NextResponse.json({ message: 'Deleted' }, { status: 200 });
    } catch (error) {
      console.error(`${modelName}_DELETE_ERROR:`, error);
      return NextResponse.json({ message: 'Failed to delete', ...errBody(error) }, { status: 500 });
    }
  };

  return { GET, POST, PUT, DELETE };
}
