import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {getAllPosts, getPostBySlug, formatPostDate} from "@/content/blog";
import BlogPostView from "@/components/BlogPostView";
import JsonLd from "@/components/JsonLd";
import {SITE, absoluteUrl} from "@/lib/site";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({slug: p.slug}));
}

export async function generateMetadata({params}: {params: Promise<{slug: string}>}): Promise<Metadata> {
  const {slug} = await params;
  const post = getPostBySlug(slug);
  if (!post) return {title: "Post not found"};
  const canonical = `/blog/${post.slug}/`;
  return {
    title: post.title,
    description: post.summary,
    alternates: {canonical},
    openGraph: {
      title: post.title,
      description: post.summary,
      url: absoluteUrl(canonical),
      type: "article",
      publishedTime: post.date,
    },
    twitter: {card: "summary_large_image", title: post.title, description: post.summary},
  };
}

export default async function BlogPostPage({params}: {params: Promise<{slug: string}>}) {
  const {slug} = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const canonical = absoluteUrl(`/blog/${post.slug}/`);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.summary,
        datePublished: post.date,
        dateModified: post.date,
        url: canonical,
        mainEntityOfPage: canonical,
        inLanguage: "en",
        author: {"@id": `${SITE.url}/#organization`},
        publisher: {"@id": `${SITE.url}/#organization`},
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {"@type": "ListItem", position: 1, name: "Home", item: SITE.url},
          {"@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog/")},
          {"@type": "ListItem", position: 3, name: post.title, item: canonical},
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <Link href='/blog/' className='back-link'>
        ← All posts
      </Link>

      <article className='blog-post'>
        <div className='bp-meta'>
          {formatPostDate(post.date)} · {post.readingMinutes} min read
        </div>
        <h1 className='bp-title'>{post.title}</h1>
        {post.arabic && (
          <div className='bp-arabic' dir='rtl'>
            {post.arabic}
          </div>
        )}

        <BlogPostView body={post.body} />
      </article>
    </>
  );
}
