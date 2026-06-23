import { createCrud } from '@/lib/crudRoute';

const crud = createCrud(
  'inspirationImage',
  [
    { name: 'image', type: 'image' },
    { name: 'link', type: 'string', default: '/' },
    { name: 'order', type: 'int', default: 0 },
  ],
  'inspiration'
);

export const GET = crud.GET;
export const POST = crud.POST;
export const PUT = crud.PUT;
export const DELETE = crud.DELETE;
