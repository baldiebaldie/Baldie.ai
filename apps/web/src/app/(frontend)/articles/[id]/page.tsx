import { getPayload } from "payload";
import config from "@payload-config";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 60;

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const payload = await getPayload({ config });

  let article;
  try {
    article = await payload.findByID({ collection: "articles", id });
  } catch {
    notFound();
  }

  if (!article || article.status !== "published") {
    notFound();
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      <Link href="/">← Back</Link>

      <h1 style={{ marginTop: "1rem" }}>{article.title ?? "Untitled"}</h1>

      {article.publishedAt && (
        <p style={{ color: "#999", marginBottom: "2rem" }}>
          {new Date(article.publishedAt).toLocaleDateString()}
        </p>
      )}

      {article.content?.tldr && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>TL;DR</h2>
          <p>{article.content.tldr}</p>
        </section>
      )}

      {article.content?.careerImpact && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Career Impact</h2>
          <p>{article.content.careerImpact}</p>
        </section>
      )}

      {article.content?.technicalBreakdown && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Technical Breakdown</h2>
          <p>{article.content.technicalBreakdown}</p>
        </section>
      )}

      {article.content?.actionItems && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Action Items</h2>
          <p>{article.content.actionItems}</p>
        </section>
      )}

      <footer style={{ borderTop: "1px solid #eee", paddingTop: "1rem", marginTop: "2rem" }}>
        <a href={article.url} target="_blank" rel="noopener noreferrer">
          View original source →
        </a>
      </footer>
    </main>
  );
}
