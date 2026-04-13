"use server";

import { getPayload } from "payload";
import config from "@payload-config";

export async function submitLink(url: string, title: string): Promise<void> {
  const payload = await getPayload({ config });
  await payload.create({
    collection: "articles",
    data: {
      url,
      title,
      status: "pending",
    },
  });
  // The enqueueArticle afterChange hook fires automatically from here
}
