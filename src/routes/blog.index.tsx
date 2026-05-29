import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, SiteLayout } from "@/components/SiteLayout";
import { useServerDataset } from "@/hooks/use-server-dataset";
import { seedBlogPosts, type BlogPost } from "@/data/blog";
import { ArrowRight, Calendar, Tag } from "lucide-react";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Abhay Road Carrier" },
      {
        name: "description",
        content:
          "Logistics insights, freight market notes, and industry facts from the Abhay Road Carrier team.",
      },
    ],
  }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const { value: posts } = useServerDataset<BlogPost[]>("blog-posts", seedBlogPosts);

  const sorted = posts.slice().sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Insights"
        title="Logistics insights and industry notes"
        subtitle="Quick reads from the Abhay Road Carrier team — freight market shifts, on-the-road practical tips, and B2B logistics facts."
      />
      <section className="container mx-auto px-4 py-12">
        {sorted.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No blog posts yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((post) => (
              <Link
                key={post.id}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="group border border-border rounded-xl bg-card overflow-hidden hover:border-accent transition-all hover:shadow-lg hover:shadow-navy/5 flex flex-col"
              >
                {post.coverImage ? (
                  <div className="aspect-[16/9] bg-secondary overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-gradient-to-br from-navy to-navy/70 grid place-items-center text-accent">
                    <Tag className="size-10" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3" />
                      {formatDate(post.publishedAt)}
                    </span>
                    {post.tags.slice(0, 1).map((t) => (
                      <span key={t} className="font-mono uppercase tracking-widest text-accent">
                        {t}
                      </span>
                    ))}
                  </div>
                  <h2 className="font-display font-bold text-xl text-navy mt-3 group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2 flex-1">{post.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-navy group-hover:text-accent">
                    Read more <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
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
