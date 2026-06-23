'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, User } from 'lucide-react';
import Reveal, { StaggerGroup, StaggerItem } from '@/sharecomponent/anim/Reveal';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string | null;
  image: string | null;
  link: string | null;
  author: string | null;
  createdAt?: string | null;
}

const BlogSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/blog')
      .then((r) => (r.ok ? r.json() : []))
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || posts.length === 0) return null;

  const formatDate = (raw?: string | null) => {
    if (!raw) return null;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return null;
    return {
      day: d.toLocaleDateString('en-US', { day: '2-digit' }),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  };

  return (
    <section className="max-w-[1200px] mx-auto px-4 md:px-8 py-16">
      <Reveal>
        <h2 className="text-center text-[22px] md:text-[26px] font-semibold tracking-tight text-zinc-900 mb-12">
          From the Blog
        </h2>
      </Reveal>
      <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => {
          const date = formatDate(post.createdAt);
          return (
            <StaggerItem key={post.id}>
            <Link
              href={post.link || '/'}
              className="group flex h-[200px] md:h-[230px] bg-white border border-zinc-100 shadow-sm hover:shadow-md transition-shadow rounded-sm overflow-hidden"
            >
              {/* Fixed image with date badge */}
              <div className="relative w-[42%] h-full flex-shrink-0 overflow-hidden bg-zinc-100">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-zinc-200" />
                )}
                {date && (
                  <div className="absolute top-0 left-4 bg-[#a99e93] text-white text-center px-3 py-2 leading-none">
                    <span className="block text-lg font-semibold">{date.day}</span>
                    <span className="block text-[10px] uppercase tracking-wide">{date.month}</span>
                  </div>
                )}
              </div>

              {/* Text content */}
              <div className="flex-1 p-5 md:p-6 overflow-hidden flex flex-col justify-center">
                {post.author && (
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-3">
                    <User size={13} />
                    <span>{post.author}</span>
                  </div>
                )}
                <h3 className="text-base md:text-lg font-semibold text-zinc-900 leading-snug group-hover:text-pink-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-2 text-sm text-zinc-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
                )}
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-zinc-500 group-hover:text-pink-600 group-hover:gap-2.5 transition-all">
                  Continue reading <ArrowRight size={13} />
                </span>
              </div>
            </Link>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </section>
  );
};

export default BlogSection;
