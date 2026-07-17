import type {Metadata} from "next";
import Link from "next/link";
import {getAllPosts, formatPostDate} from "@/content/blog";

const DESCRIPTION = "Reflections and encouragement on memorizing and understanding the Quran, one small step at a time.";

export const metadata: Metadata = {
  title: "Blog",
  description: DESCRIPTION,
  alternates: {canonical: "/blog/"},
  openGraph: {
    title: "Blog · Learn Quran",
    description: DESCRIPTION,
    url: "/blog/",
    type: "website",
  },
  twitter: {card: "summary_large_image", title: "Blog · Learn Quran", description: DESCRIPTION},
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <>
      <Link href='/' className='back-link'>
        ← All surahs
      </Link>

      <section className='hero'>
        <div className='hero-eyebrow'>Reflections</div>
        <h1 className='hero-title'>Blog</h1>
        <p className='hero-text'>
          Short, honest pieces on memorizing and understanding the Quran — the why behind the effort, and practical ways to keep going.
        </p>
      </section>

      <div className='blog-list'>
        {posts.map((post) => (
          <Link href={`/blog/${post.slug}/`} className='blog-card' key={post.slug}>
            <div className='bc-meta'>
              {formatPostDate(post.date)} · {post.readingMinutes} min read
            </div>
            <div className='bc-title'>{post.title}</div>
            <div className='bc-summary'>{post.summary}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
