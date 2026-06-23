import { createCrud } from '@/lib/crudRoute';

const crud = createCrud(
  'blogPost',
  [
    { name: 'title', type: 'string' },
    { name: 'excerpt', type: 'string', default: '' },
    { name: 'image', type: 'image' },
    { name: 'link', type: 'string', default: '/' },
    { name: 'author', type: 'string', default: 'Admin' },
    { name: 'order', type: 'int', default: 0 },
  ],
  'blog'
);

export const GET = crud.GET;
export const POST = crud.POST;
export const PUT = crud.PUT;
export const DELETE = crud.DELETE;
