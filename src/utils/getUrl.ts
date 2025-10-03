import { headers } from "next/headers";

export function getBaseUrl(path = ""): string {
  const env = process.env.NEXT_PUBLIC_APP_URL;

  return env ? `${env}${path.startsWith("/") ? path : `/${path}`}` : "";
}
