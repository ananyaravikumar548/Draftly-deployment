import { google } from "googleapis";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { renderToBuffer } from "@react-pdf/renderer";

import { getGoogleOAuthClient } from "@/src/lib/google";
import { collection, databaseErrorResponse } from "@/src/lib/mongo";
import {
  ResumeSchema,
  type ApplicationRecord,
  type ResumeData,
} from "@/src/lib/application-types";
import type { PortfolioRecord } from "@/src/lib/portfolio-types";
import { ResumeDocument } from "@/src/components/resume/ResumeDocument";

export const dynamic = "force-dynamic";

type GmailConnection = {
  _id: ObjectId;
  email: string;
  refreshToken: string;
  connectedAt: Date;
};

const DraftSchema = z.object({
  application_id: z.string().min(1),
});

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function wrapBase64(value: string) {
  return value.match(/.{1,76}/g)?.join("\r\n") ?? value;
}

async function renderResumePdf(resume: ResumeData) {
  return renderToBuffer(<ResumeDocument data={resume} />);
}

function escapeHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export async function POST(request: Request) {
  const requestStartedAt = Date.now();

  console.info("[gmail/draft] POST start");

  try {
    // ---------------------------------------------------------
    // 1. Validate request
    // ---------------------------------------------------------

    const raw: unknown = await request.json();

    const parsed = DraftSchema.safeParse(raw);

    if (!parsed.success) {
      return Response.json(
        {
          error:
            "An application is required to create a Gmail draft.",
        },
        { status: 400 }
      );
    }

    const applicationId = parsed.data.application_id;

    if (!ObjectId.isValid(applicationId)) {
      return Response.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    // ---------------------------------------------------------
    // 2. Get connected Gmail account
    // ---------------------------------------------------------

    const connections =
      await collection<GmailConnection>("gmail_connections");

    const connection = await connections.findOne(
      {},
      { sort: { connectedAt: -1 } }
    );

    if (!connection?.refreshToken) {
      return Response.json(
        {
          error: "Connect Gmail before creating a draft.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // 3. Get application
    // ---------------------------------------------------------

    const applications =
      await collection<ApplicationRecord>("applications");

    const application = await applications.findOne({
      _id: new ObjectId(applicationId),
    });

    if (!application) {
      return Response.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    // ---------------------------------------------------------
    // 4. Get recruiter email
    // ---------------------------------------------------------

    const to = application.recipient_email?.trim();

    if (!to) {
      return Response.json(
        {
          error:
            "This application has no recipient email address.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // 5. Get drafted email
    // ---------------------------------------------------------

    const subject =
      application.analysis?.email_subject?.trim() ||
      `Application for ${application.job_title} at ${application.company_name}`;

    const body =
      application.analysis?.email_body?.trim();

    if (!body) {
      return Response.json(
        {
          error:
            "This application has no drafted email body.",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // 6. Recreate the same resume used by Draftly's PDF route
    // ---------------------------------------------------------

    const resume = ResumeSchema.parse(
      application.resume_json
    );

    // Add achievements if they are not already present.
    if (!resume.achievements.length) {
      const portfolio =
        await collection<PortfolioRecord>("portfolio_items");

      const achievements = await portfolio
        .find(
          { type: "achievement" },
          {
            projection: {
              title: 1,
              description: 1,
            },
          }
        )
        .toArray();

      resume.achievements = achievements.map(
        ({ title, description }) => ({
          title,
          description,
        })
      );
    }

    // Generate the exact same PDF used by Draftly.
    const pdf = await renderResumePdf(resume);

    const filename =
      `${application.company_name}-${application.job_title}-resume.pdf`
        .replace(/[^a-z0-9._-]+/gi, "-")
        .slice(0, 100);

    // Convert PDF to base64.
    const pdfBase64 = wrapBase64(
      Buffer.from(pdf).toString("base64")
    );

    // ---------------------------------------------------------
    // 7. Build multipart MIME email
    // ---------------------------------------------------------

    const boundary = `DraftlyBoundary_${Date.now()}`;

    const mimeMessage = [
      `To: ${escapeHeader(to)}`,
      `Subject: ${escapeHeader(subject)}`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      body,
      "",
      `--${boundary}`,
      `Content-Type: application/pdf; name="${filename}"`,
      `Content-Disposition: attachment; filename="${filename}"`,
      "Content-Transfer-Encoding: base64",
      "",
      pdfBase64,
      "",
      `--${boundary}--`,
    ].join("\r\n");

    // ---------------------------------------------------------
    // 8. Authenticate with connected Gmail
    // ---------------------------------------------------------

    const oauth2Client = getGoogleOAuthClient();

    oauth2Client.setCredentials({
      refresh_token: connection.refreshToken,
    });

    const gmail = google.gmail({
      version: "v1",
      auth: oauth2Client,
    });

    // ---------------------------------------------------------
    // 9. CREATE DRAFT ONLY
    // ---------------------------------------------------------
    // This does NOT send the email.

    const { data: created } =
      await gmail.users.drafts.create({
        userId: "me",
        requestBody: {
          message: {
            raw: toBase64Url(mimeMessage),
          },
        },
      });

    if (!created.id) {
      throw new Error(
        "Gmail did not return a draft ID."
      );
    }

    // ---------------------------------------------------------
    // 10. Update application status
    // ---------------------------------------------------------

    await applications.updateOne(
      { _id: application._id },
      {
        $set: {
          status: "Draft Created",
          updated_at: new Date(),
        },
      }
    );

    console.info(
      `[gmail/draft] POST completed in ${(Date.now() - requestStartedAt).toFixed(1)}ms`
    );

    return Response.json({
      success: true,
      draft_id: created.id,
      thread_id: created.message?.threadId ?? null,
      to,
      subject,
      filename,
      gmail_url: `https://mail.google.com/mail/u/0/#drafts/${created.id}`,
    });
  } catch (error) {
    console.warn(
      `[gmail/draft] POST failed after ${(Date.now() - requestStartedAt).toFixed(1)}ms`,
      error
    );

    return databaseErrorResponse(error);
  }
}