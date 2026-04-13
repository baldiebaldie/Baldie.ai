import { getPayload } from "payload";
import config from "@payload-config";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const payload = await getPayload({ config });

  const { docs: articles } = await payload.find({
    collection: "articles",
    where: { status: { equals: "published" } },
    sort: "-publishedAt",
    limit: 20,
  });

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <h1>Baldie.ai</h1>
        <p>AI learning & news — synthesized for developers building AI careers.</p>
      </header>

      {articles.length === 0 ? (
        <p>No published articles yet. Check back soon.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {articles.map((article) => (
            <li key={article.id} style={{ marginBottom: "1.5rem", borderBottom: "1px solid #eee", paddingBottom: "1.5rem" }}>
              <Link href={`/articles/${article.id}`}>
                <strong>{article.title ?? article.url}</strong>
              </Link>
              {article.content?.tldr && (
                <p style={{ margin: "0.5rem 0 0", color: "#555" }}>{article.content.tldr}</p>
              )}
              {article.publishedAt && (
                <small style={{ color: "#999" }}>
                  {new Date(article.publishedAt).toLocaleDateString()}
                </small>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
