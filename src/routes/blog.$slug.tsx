import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { useServerDataset } from "@/hooks/use-server-dataset";
import { seedBlogPosts, type BlogPost } from "@/data/blog";
import { ArrowLeft, Calendar, Copy, Linkedin, MessageCircle, Tag, User } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogDetailPage,
});

function BlogDetailPage() {
  const { slug } = Route.useParams();
  const { value: posts } = useServerDataset<BlogPost[]>("blog-posts", seedBlogPosts);
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    // Show a graceful in-page 404 instead of throwing — content may still be
    // loading from KV on first paint.
    return (
      <SiteLayout>
        <section className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Loading post…</p>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <article className="container mx-auto px-4 py-12 max-w-3xl">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1 text-sm font-semibold text-navy hover:text-accent"
        >
          <ArrowLeft className="size-4" /> All posts
        </Link>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <User className="size-3" />
              {post.author}
            </span>
            {post.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 font-mono uppercase tracking-widest text-accent"
              >
                <Tag className="size-3" />
                {t}
              </span>
            ))}
          </div>
          <h1 className="font-display font-bold text-3xl md:text-5xl text-navy mt-4">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-muted-foreground mt-4 leading-relaxed">{post.excerpt}</p>
          )}
        </header>

        {post.coverImage && (
          <div className="mt-8 rounded-xl overflow-hidden border border-border">
            <img src={post.coverImage} alt={post.title} className="w-full h-auto" loading="eager" />
          </div>
        )}

        <div
          className="prose prose-neutral max-w-none mt-8 prose-headings:font-display prose-headings:text-navy prose-a:text-accent"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        <ShareBar title={post.title} />
      </article>
    </SiteLayout>
  );
}

function ShareBar({ title }: { title: string }) {
  const [url, setUrl] = useState<string | null>(null);
  // Read window.location lazily so we stay SSR-safe.
  useState(() => {
    if (typeof window !== "undefined") setUrl(window.location.href);
    return undefined;
  });

  const shareUrl = url ?? "";
  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${title} — ${shareUrl}`)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard.");
    } catch {
      toast.error("Could not copy. Long-press the URL bar instead.");
    }
  };

  return (
    <div className="mt-12 border-t border-border pt-6 flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-muted-foreground">Share this post:</span>
      <a href={linkedIn} target="_blank" rel="noopener noreferrer">
        <Button size="sm" variant="outline">
          <Linkedin className="size-4 mr-1" /> LinkedIn
        </Button>
      </a>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer">
        <Button
          size="sm"
          variant="outline"
          className="text-[#25D366] border-[#25D366] hover:bg-[#25D366]/10"
        >
          <MessageCircle className="size-4 mr-1" /> WhatsApp
        </Button>
      </a>
      <Button size="sm" variant="outline" onClick={copy}>
        <Copy className="size-4 mr-1" /> Copy link
      </Button>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}
