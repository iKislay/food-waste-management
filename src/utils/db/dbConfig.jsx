import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
const sql = neon(
  "postgresql://neondb_owner:npg_dtEJZNyBcz95@ep-nameless-wildflower-a4en05xc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
);
export const db = drizzle(sql, { schema });
