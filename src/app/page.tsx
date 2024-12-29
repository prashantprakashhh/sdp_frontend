'use client';

import Categories from '@/components/custom/Categories';
import Footer from '@/components/custom/Footer';
import Hero from '@/components/custom/Hero';
import { GET_CATEGORIES } from '@/graphql/queries';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
import ProductsByCategoryId from '@/components/custom/ProductsByCategoryId';


export default function Home() {
  const { data, loading, error } = useQuery(GET_CATEGORIES);

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p>Error loading categories: {error.message}</p>;

  const categories = data?.categories || [];

  return (
    <>
      <Hero />
      <section className="p-4">
        <h2 className="mb-4 text-2xl">Categories</h2>
        <ul className="space-y-2">
          {categories.map((cat: { categoryId: number; name: string }) => (
            <li key={cat.categoryId}>
              <Link href={`/products?categoryId=${cat.categoryId}`}>
                <span className="cursor-pointer text-blue-600 hover:underline">
                  {cat.name}
                </span>
              </Link>
              <ProductsByCategoryId categoryId={Number(cat.categoryId)} />
            </li>
          ))}
        </ul>
      </section>
      {/* You can add more sections like Featured Products, Testimonials, Newsletter Signup, etc. */}
      <Footer />
    </>
  );
}