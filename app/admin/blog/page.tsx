import type { Metadata } from "next";
import { getArticles, saveArticles } from "@/lib/data";
import { revalidatePath } from "next/cache";
import { getAuthenticatedAdmin } from "@/lib/auth";
import { BlogClient } from "./BlogClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
};

async function saveArticle(formData: FormData) {
  "use server";
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");
  const articles = await getArticles();
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const coverImage = formData.get("coverImage") as string || "";
  const author = formData.get("author") as string || "";
  const tags = (formData.get("tags") as string || "").split(",").map((t) => t.trim()).filter(Boolean);
  const publishDate = formData.get("publishDate") as string || new Date().toISOString();
  const published = formData.getAll("published").includes("true");
  const order = parseInt(formData.get("order") as string) || 0;

  const entry = { id: id || Math.random().toString(36).slice(2, 11), title, slug, content, coverImage, author, tags, publishDate, published, order };

  if (id) {
    const idx = articles.findIndex((a) => a.id === id);
    if (idx !== -1) articles[idx] = entry;
  } else {
    articles.push(entry);
  }
  await saveArticles(articles);
  revalidatePath("/");
  revalidatePath("/admin/blog");
}

async function deleteArticle(formData: FormData) {
  "use server";
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Unauthorized");
  const id = formData.get("id") as string;
  const allArt = await getArticles();
  await saveArticles(allArt.filter((a) => a.id !== id));
  revalidatePath("/");
  revalidatePath("/admin/blog");
}

export default async function AdminBlogPage() {
  const articles = await getArticles();
  return (
    <div className="container-shell mx-auto px-6 py-10">
      <BlogClient articles={articles} saveArticle={saveArticle} deleteArticle={deleteArticle} />
    </div>
  );
}
