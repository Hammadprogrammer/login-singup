import { createCrud } from '@/lib/crudRoute';

const crud = createCrud(
  'saleBanner',
  [
    { name: 'image', type: 'image' },
    { name: 'heading', type: 'string' },
    { name: 'subheading', type: 'string', default: '' },
    { name: 'buttonText', type: 'string', default: 'Shop now' },
    { name: 'link', type: 'string', default: '/' },
    { name: 'order', type: 'int', default: 0 },
  ],
  'sale_banners'
);

export const GET = crud.GET;
export const POST = crud.POST;
export const PUT = crud.PUT;
export const DELETE = crud.DELETE;
