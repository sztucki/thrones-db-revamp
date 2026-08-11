import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(4000),
  SESSION_COOKIE_NAME: z.string().default("thrones_session"),
  SESSION_TTL_DAYS: z.coerce.number().default(30),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  CARD_DATA_REPO_URL: z
    .string()
    .default("https://raw.githubusercontent.com/throneteki/throneteki-json-data/master"),
  THRONESDB_PUBLIC_API_URL: z.string().default("https://thronesdb.com/api/public"),
  AZURE_STORAGE_CONNECTION_STRING: z
    .string()
    .default(
      "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;"
    ),
  AZURE_STORAGE_CONTAINER_NAME: z.string().default("card-images"),
});

export const config = envSchema.parse(process.env);
