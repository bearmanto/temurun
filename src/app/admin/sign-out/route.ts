

import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/env";

export async function GET(req: Request) {
  const url = new URL("/admin/sign-in", new URL(req.url).origin);
  const res = NextResponse.redirect(url);
  // Hard-expire the cookie on the response so middleware no longer sees a session
  res.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
    maxAge: 0,
    expires: new Date(0),
  });
  return res;
}