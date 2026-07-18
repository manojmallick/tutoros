import { NextResponse } from "next/server";

export const MAX_GENERATION_REQUEST_BYTES = 32 * 1024;
export const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

export function declaredBodyTooLarge(request: Request) {
  const declaredLength = Number(request.headers.get("content-length"));
  return Number.isFinite(declaredLength) && declaredLength > MAX_GENERATION_REQUEST_BYTES;
}

export function noStoreJson(body: unknown, init: ResponseInit = {}) {
  return NextResponse.json(body, {
    ...init,
    headers: { ...NO_STORE_HEADERS, ...init.headers },
  });
}
