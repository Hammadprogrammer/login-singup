'use client';

import React from 'react';
import { Shapes, Megaphone, Images, Newspaper, Quote, Star } from 'lucide-react';
import EntityCRUD from '../generic/EntityCRUD';

export const FeaturedProductsCRUD = () => (
  <EntityCRUD
    title="Featured Products"
    description="Curated products shown in the homepage 'Featured Products' grid."
    apiPath="/api/dashboard/featured-product"
    icon={Star}
    card={{ image: 'image', title: 'title', subtitle: 'price' }}
    fields={[
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'Cashmere Crew Sweater' },
      { name: 'price', label: 'Price', type: 'text', placeholder: '129 USDT' },
      { name: 'brand', label: 'Brand', type: 'text', placeholder: 'Aurora' },
      { name: 'link', label: 'Link', type: 'text', placeholder: '/product/123' },
      { name: 'order', label: 'Display Order', type: 'number' },
    ]}
  />
);

export const CategoryCRUD = () => (
  <EntityCRUD
    title="Shop by Category"
    description="Circular category icons shown on the homepage."
    apiPath="/api/dashboard/category"
    icon={Shapes}
    card={{ image: 'image', title: 'name', subtitle: 'link' }}
    fields={[
      { name: 'name', label: 'Category Name', type: 'text', required: true, placeholder: 'Knitwear' },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'link', label: 'Link', type: 'text', placeholder: '/accessories' },
      { name: 'order', label: 'Display Order', type: 'number' },
    ]}
  />
);

export const SaleBannerCRUD = () => (
  <EntityCRUD
    title="Sale Banner"
    description="The mid-page 'Best of Summer Sale' banner."
    apiPath="/api/dashboard/sale-banner"
    icon={Megaphone}
    card={{ image: 'image', title: 'heading', subtitle: 'subheading' }}
    fields={[
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'heading', label: 'Heading', type: 'text', required: true, placeholder: 'Best of Summer Sale' },
      { name: 'subheading', label: 'Subheading', type: 'textarea', placeholder: 'Get up to 50% off on selected items.' },
      { name: 'buttonText', label: 'Button Text', type: 'text', placeholder: 'Shop now' },
      { name: 'link', label: 'Link', type: 'text', placeholder: '/sale' },
      { name: 'order', label: 'Display Order', type: 'number' },
    ]}
  />
);

export const InspirationCRUD = () => (
  <EntityCRUD
    title="Inspiration Gallery"
    description="Image grid shown under the sale banner."
    apiPath="/api/dashboard/inspiration"
    icon={Images}
    card={{ image: 'image', title: 'link' }}
    fields={[
      { name: 'image', label: 'Image', type: 'image', required: true },
      { name: 'link', label: 'Link', type: 'text', placeholder: '/new-in' },
      { name: 'order', label: 'Display Order', type: 'number' },
    ]}
  />
);

export const BlogCRUD = () => (
  <EntityCRUD
    title="From the Blog"
    description="Blog cards shown near the bottom of the homepage."
    apiPath="/api/dashboard/blog"
    icon={Newspaper}
    card={{ image: 'image', title: 'title', subtitle: 'excerpt' }}
    fields={[
      { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'How to style knitwear' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', placeholder: 'Short preview text...' },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'author', label: 'Author', type: 'text', placeholder: 'Admin' },
      { name: 'link', label: 'Link', type: 'text', placeholder: '/blog/styling-knitwear' },
      { name: 'order', label: 'Display Order', type: 'number' },
    ]}
  />
);

export const TestimonialCRUD = () => (
  <EntityCRUD
    title="Testimonials"
    description="Customer quotes shown in the testimonial section."
    apiPath="/api/dashboard/testimonial"
    icon={Quote}
    card={{ title: 'author', subtitle: 'quote' }}
    fields={[
      { name: 'quote', label: 'Quote', type: 'textarea', required: true, placeholder: 'The quality is amazing...' },
      { name: 'author', label: 'Author', type: 'text', required: true, placeholder: 'Sarah K.' },
      { name: 'brand', label: 'Brand / Role', type: 'text', placeholder: 'Verified Buyer' },
      { name: 'order', label: 'Display Order', type: 'number' },
    ]}
  />
);
