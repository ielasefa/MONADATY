import type { Metadata } from "next";
import { getArticles } from "@/lib/data";
import { getLanguage, getTranslation, loadTranslations } from "@/lib/translations";
import { BlogClient } from "./BlogClient";
import { saveArticle, deleteArticle } from "@/lib/actions/admin-blog";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLanguage();
  const translations = await loadTranslations("admin");
  return { title: getTranslation(translations, "blog_page_title", lang, "Blog — Admin") };
}

export default async function AdminBlogPage() {
  const articles = await getArticles();
  return (
    <div className="container-shell mx-auto px-6 py-10">
      <BlogClient articles={articles} saveArticle={saveArticle} deleteArticle={deleteArticle} />
    </div>
  );
}
