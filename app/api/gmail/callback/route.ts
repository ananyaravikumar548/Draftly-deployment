import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getGoogleOAuthClient } from "@/src/lib/google";
import { collection } from "@/src/lib/mongo";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    const savedState = request.cookies.get("gmail_oauth_state")?.value;

    if (!code) {
      return NextResponse.json(
        { error: "Missing Google authorization code." },
        { status: 400 }
      );
    }

    if (!state || !savedState || state !== savedState) {
      return NextResponse.json(
        { error: "Invalid OAuth state." },
        { status: 400 }
      );
    }

    const oauth2Client = getGoogleOAuthClient();

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.json(
        { error: "Google did not return a refresh token. Please reconnect Gmail." },
        { status: 400 }
      );
    }

    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      version: "v2",
      auth: oauth2Client,
    });

    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email) {
      return NextResponse.json(
        { error: "Google did not return an account email." },
        { status: 400 }
      );
    }

    const gmailConnections = await collection("gmail_connections");

    await gmailConnections.updateOne(
      { email: userInfo.email },
      {
        $set: {
          refreshToken: tokens.refresh_token,
          connectedAt: new Date(),
        },
      },
      { upsert: true }
    );

    const response = NextResponse.redirect(
      new URL("/?gmail=connected", request.url)
    );

    response.cookies.delete("gmail_oauth_state");

    return response;
  } catch (error) {
    console.error("Gmail OAuth callback error:", error);

    return NextResponse.json(
      { error: "Failed to connect Gmail." },
      { status: 500 }
    );
  }
}