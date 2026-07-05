import { Resend } from "resend";

const contactEmail = "elias@lankinen.xyz";
const placeholderValues = new Set(["", "replace-with-resend-api-key", "replace-with-verified-sender"]);

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
};

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() ?? "";

  if (!isConfigured(apiKey, fromEmail)) {
    return Response.json({ error: "contact_not_configured" }, { status: 500 });
  }

  let payload: ContactPayload;

  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const name = toCleanString(payload.name);
  const email = toCleanString(payload.email).toLowerCase();
  const message = toCleanString(payload.message);

  if (!name || !isValidEmail(email) || !message) {
    return Response.json({ error: "invalid_fields" }, { status: 400 });
  }

  if (name.length > 120 || email.length > 254 || message.length > 4000) {
    return Response.json({ error: "fields_too_long" }, { status: 400 });
  }

  try {
    const resend = new Resend(apiKey);

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: contactEmail,
      replyTo: email,
      subject: `Website contact from ${name}`,
      text: [`Name: ${name}`, `Email: ${email}`, "", message].join("\n"),
      html: `
        <div>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, "<br />")}</p>
        </div>
      `,
    });

    if (error) {
      throw new Error(error.message);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to send contact email", error);

    return Response.json({ error: "email_unavailable" }, { status: 502 });
  }
}

function isConfigured(apiKey: string, fromEmail: string) {
  return [apiKey, fromEmail].every((value) => !placeholderValues.has(value) && !value.startsWith("replace-with-"));
}

function toCleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
