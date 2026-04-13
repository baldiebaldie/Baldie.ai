import { getPayload } from "payload";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import config from "@payload-config";
import { fetchDiscoveredLinks } from "@/lib/discovery/index";
import { SubmitButton } from "./SubmitButton";

export const dynamic = "force-dynamic";

const SOURCE_LABELS: Record<string, string> = {
  hackernews: "HN",
  reddit: "Reddit",
};

const SOURCE_COLORS: Record<string, { bg: string; color: string }> = {
  hackernews: { bg: "#fff3e0", color: "#e65100" },
  reddit: { bg: "#fce4ec", color: "#ad1457" },
};

export default async function DiscoverPage() {
  // Auth check — require Payload session
  const payload = await getPayload({ config });
  const headersList = await headers();
  const { user } = await payload.auth({ headers: headersList });

  if (!user) {
    redirect("/admin/login");
  }

  const links = await fetchDiscoveredLinks();

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "2rem 1rem" }}>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0 }}>Hot in AI</h1>
        <p style={{ color: "#6b7280", margin: "0.4rem 0 0" }}>
          Top stories from Hacker News + Reddit — last 24h, filtered to AI/ML.
        </p>
      </header>

      {links.length === 0 ? (
        <p style={{ color: "#6b7280" }}>
          No AI stories found right now. Both sources may be temporarily unavailable.
        </p>
      ) : (
        <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {links.map((link, i) => {
            const sourceStyle = SOURCE_COLORS[link.source] ?? {
              bg: "#f3f4f6",
              color: "#374151",
            };
            return (
              <li
                key={`${link.source}-${link.url}`}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  padding: "1rem 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                {/* Score */}
                <span
                  style={{
                    minWidth: 42,
                    textAlign: "right",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#374151",
                    paddingTop: 2,
                  }}
                >
                  ▲ {link.score}
                </span>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontWeight: 600,
                      color: "#111",
                      textDecoration: "none",
                      fontSize: 15,
                      lineHeight: 1.4,
                    }}
                  >
                    {link.title}
                  </a>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginTop: "0.35rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 3,
                        background: sourceStyle.bg,
                        color: sourceStyle.color,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {SOURCE_LABELS[link.source] ?? link.source}
                    </span>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>
                      {new URL(link.url).hostname.replace(/^www\./, "")}
                    </span>
                  </div>
                </div>

                {/* Add button */}
                <div style={{ paddingTop: 2 }}>
                  <SubmitButton url={link.url} title={link.title} />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
