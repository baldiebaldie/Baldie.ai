import type { CollectionConfig } from "payload";
import { enqueueArticle } from "../hooks/enqueueArticle";

export const Articles: CollectionConfig = {
  slug: "articles",
  admin: {
    defaultColumns: ["title", "url", "status", "createdAt"],
    useAsTitle: "title",
  },
  fields: [
    {
      name: "url",
      type: "text",
      required: true,
      label: "Source URL",
    },
    {
      name: "title",
      type: "text",
      label: "Title",
      admin: {
        description: "Auto-populated by the Brain after processing.",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Processing", value: "processing" },
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Failed", value: "failed" },
      ],
    },
    {
      name: "content",
      type: "group",
      label: "Generated Content",
      admin: {
        description: "Populated by the Brain after AI synthesis.",
      },
      fields: [
        {
          name: "tldr",
          type: "textarea",
          label: "TL;DR",
        },
        {
          name: "careerImpact",
          type: "textarea",
          label: "Career Impact",
        },
        {
          name: "technicalBreakdown",
          type: "textarea",
          label: "Technical Breakdown",
        },
        {
          name: "actionItems",
          type: "textarea",
          label: "Action Items",
        },
        {
          name: "fullMarkdown",
          type: "textarea",
          label: "Full Markdown",
          admin: {
            description: "Complete rendered post in Markdown.",
          },
        },
      ],
    },
    {
      name: "errorMessage",
      type: "text",
      label: "Error Message",
      admin: {
        description: "Set by the Brain if processing fails.",
        condition: (data) => data?.status === "failed",
      },
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Published At",
      admin: {
        condition: (data) => data?.status === "published",
      },
    },
    {
      name: "submittedBy",
      type: "text",
      label: "Submitted By",
      admin: {
        description: "Team member who submitted this link.",
      },
    },
  ],
  hooks: {
    afterChange: [enqueueArticle],
  },
  access: {
    // Read access: anyone can read published articles, authenticated users see all
    read: ({ req }) => {
      if (req.user) return true;
      return { status: { equals: "published" } };
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
};
