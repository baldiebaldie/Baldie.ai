"use client";

import { useActionState } from "react";
import { submitLink } from "./actions";

interface Props {
  url: string;
  title: string;
}

const SOURCE_LABELS: Record<string, string> = {
  hackernews: "HN",
  reddit: "Reddit",
};

export function SubmitButton({ url, title }: Props) {
  const [state, action, pending] = useActionState(
    async (_prev: string, _formData: FormData) => {
      await submitLink(url, title);
      return "added";
    },
    "idle"
  );

  if (state === "added") {
    return (
      <span
        style={{
          padding: "4px 12px",
          borderRadius: 4,
          background: "#d1fae5",
          color: "#065f46",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        Added ✓
      </span>
    );
  }

  return (
    <form action={action}>
      <button
        type="submit"
        disabled={pending}
        style={{
          padding: "4px 12px",
          borderRadius: 4,
          background: pending ? "#e5e7eb" : "#111",
          color: pending ? "#6b7280" : "#fff",
          border: "none",
          cursor: pending ? "not-allowed" : "pointer",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {pending ? "Adding…" : "+ Add"}
      </button>
    </form>
  );
}
