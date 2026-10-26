/**
 * Starts the Google OAuth flow and stores short-lived state for the callback.
 */
import { NextResponse } from "next/server";
import crypto from "crypto";
import { getGoogleOAuthClient, GMAIL_SCOPES } from "@/src/lib/google";

// Create an OAuth URL and an HTTP-only state cookie to protect the callback.
export async function GET() {
  const oauth2Client = getGoogleOAuthClient();

  const state = crypto.randomBytes(32).toString("hex");

  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GMAIL_SCOPES,
    state,
  });

  const response = NextResponse.redirect(authorizationUrl);

  response.cookies.set("gmail_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  });

  return response;
}