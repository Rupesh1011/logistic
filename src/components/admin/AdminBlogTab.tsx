import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CrudTable } from "./CrudTable";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useServerDataset } from "@/hooks/use-server-dataset";
import { seedBlogPosts, type BlogPost } from "@/data/blog";

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

const validRow = (r: unknown): r is BlogPost => {
  if (!r || typeof r !== "object") return false;
  const o = r as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.slug === "string" &&
    typeof o.title === "string" &&
    typeof o.excerpt === "string" &&
    typeof o.body === "string" &&
    typeof o.author === "string" &&
    typeof o.publishedAt === "string" &&
    Array.isArray(o.tags)
  );
};
const validList = (v: unknown): v is BlogPost[] => Array.isArray(v) && v.every(validRow);

const empty = (): BlogPost => ({
  id: crypto.randomUUID(),
  slug: "",
  title: "",
  excerpt: "",
  coverImage: "",
  body: "",
  tags: [],
  author: "Abhay Road Carrier",
  publishedAt: new Date().toISOString(),
});

export function AdminBlogTab() {
  const { value: rows, set } = useServerDataset<BlogPost[]>("blog-posts", seedBlogPosts, validList);
  const [editing, setEditing] = useState<{ index: number | null; data: BlogPost } | null>(null);
  const [tagsText, setTagsText] = useState("");

  const startEdit = (post: BlogPost, index: number | null) => {
    setEditing({ index, data: { ...post } });
    setTagsText(post.tags.join(", "));
  };

  const openAdd = () => startEdit(empty(), null);
  const openEdit = (row: BlogPost) => startEdit(row, rows.indexOf(row));

  const save = async () => {
    if (!editing) return;
    const d = editing.data;
    if (!d.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!d.body.trim() || d.body === "<p></p>") {
      toast.error("Body cannot be empty.");
      return;
    }
    const slug = d.slug.trim() || slugify(d.title);
    if (!slug) {
      toast.error("Could not derive a slug. Add some letters to the title.");
      return;
    }
    const collision = rows.find(
      (r, i) => r.slug.toLowerCase() === slug.toLowerCase() && i !== editing.index,
    );
    if (collision) {
      toast.error(`Slug "${slug}" is already in use. Edit the slug to make it unique.`);
      return;
    }
    const next: BlogPost = {
      ...d,
      slug,
      tags: tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    const nextRows =
      editing.index === null
        ? [next, ...rows]
        : rows.map((r, i) => (i === editing.index ? next : r));
    const ok = await set(nextRows);
    if (!ok) return;
    setEditing(null);
    toast.success("Blog post saved.");
  };

  return (
    <>
      <CrudTable<BlogPost>
        title="Blog"
        rows={rows.slice().sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))}
        rowKey={(r) => r.id}
        columns={[
          { header: "Title", render: (r) => <span className="font-semibold">{r.title}</span> },
          {
            header: "Slug",
            render: (r) => (
              <span className="font-mono text-xs text-muted-foreground">/{r.slug}</span>
            ),
          },
          {
            header: "Tags",
            render: (r) => (
              <span className="text-xs text-muted-foreground">{r.tags.join(", ") || "—"}</span>
            ),
          },
          {
            header: "Published",
            render: (r) => (
              <span className="text-xs text-muted-foreground">{r.publishedAt.slice(0, 10)}</span>
            ),
          },
        ]}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={(row) => void set(rows.filter((r) => r.id !== row.id))}
        rowDescription={(r) => r.title}
        emptyState="No blog posts yet."
      />

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.index === null ? "New blog post" : "Edit blog post"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3 max-h-[75vh] overflow-y-auto pr-1">
              <Field label="Title">
                <Input
                  value={editing.data.title}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      data: {
                        ...editing.data,
                        title: e.target.value,
                        // Auto-derive slug only when user hasn't customized it.
                        slug: editing.data.slug || slugify(e.target.value),
                      },
                    })
                  }
                />
              </Field>
              <Field label="Slug (URL)">
                <Input
                  value={editing.data.slug}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      data: { ...editing.data, slug: slugify(e.target.value) },
                    })
                  }
                  placeholder="auto-from-title"
                />
              </Field>
              <Field label="Cover Image URL (optional)">
                <Input
                  value={editing.data.coverImage ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      data: { ...editing.data, coverImage: e.target.value },
                    })
                  }
                  placeholder="https://…"
                />
              </Field>
              <Field label="Excerpt (1–2 sentences shown on the blog list)">
                <Textarea
                  rows={2}
                  value={editing.data.excerpt}
                  onChange={(e) =>
                    setEditing({ ...editing, data: { ...editing.data, excerpt: e.target.value } })
                  }
                />
              </Field>
              <Field label="Body">
                <RichTextEditor
                  value={editing.data.body}
                  onChange={(html) =>
                    setEditing({ ...editing, data: { ...editing.data, body: html } })
                  }
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Author">
                  <Input
                    value={editing.data.author}
                    onChange={(e) =>
                      setEditing({ ...editing, data: { ...editing.data, author: e.target.value } })
                    }
                  />
                </Field>
                <Field label="Tags (comma separated)">
                  <Input
                    value={tagsText}
                    onChange={(e) => setTagsText(e.target.value)}
                    placeholder="Diesel, FTL, Industry News"
                  />
                </Field>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
