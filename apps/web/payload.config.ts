import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { Articles } from "./src/payload/collections/Articles";
import { Users } from "./src/payload/collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Articles],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET!,
  typescript: {
    outputFile: path.resolve(dirname, "src/payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL!,
    },
  }),
  plugins: [],
});
