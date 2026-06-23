import { createCrud } from '@/lib/crudRoute';

const crud = createCrud(
  'featuredProduct',
  [
    { name: 'image', type: 'image' },
    { name: 'title', type: 'string' },
    { name: 'price', type: 'string', default: '' },
    { name: 'brand', type: 'string', default: '' },
    { name: 'link', type: 'string', default: '/' },
    { name: 'order', type: 'int', default: 0 },
  ],
  'featured_products'
);

export const GET = crud.GET;
export const POST = crud.POST;
export const PUT = crud.PUT;
export const DELETE = crud.DELETE;
