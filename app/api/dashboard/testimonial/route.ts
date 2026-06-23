import { createCrud } from '@/lib/crudRoute';

const crud = createCrud(
  'testimonial',
  [
    { name: 'quote', type: 'string' },
    { name: 'author', type: 'string' },
    { name: 'brand', type: 'string', default: '' },
    { name: 'order', type: 'int', default: 0 },
  ],
  'testimonials'
);

export const GET = crud.GET;
export const POST = crud.POST;
export const PUT = crud.PUT;
export const DELETE = crud.DELETE;
