import nodemailer from "nodemailer";
import { decryptCredential } from "./credentials";
import { getPrivateEmailDeliverySetting } from "./db";

type EmailEvent = "login" | "passwordReset" | "passwordChanged" | "orderUpdates" | "errors" | "discounts";

async function deliverWithSetting(setting: NonNullable<Awaited<ReturnType<typeof getPrivateEmailDeliverySetting>>>, recipient: string, subject: string, html: string) {
  const from = `${setting.senderName} <${setting.senderEmail}>`;
  if (setting.provider === "resend") {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${decryptCredential(setting.secretCiphertext)}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [recipient], reply_to: setting.replyToEmail || undefined, subject, html }) });
    if (!response.ok) throw new Error(`Resend recusou o envio (${response.status}). Confira a chave e verifique o domínio remetente.`);
    return;
  }
  if (!setting.smtpHost || !setting.smtpPort || !setting.smtpUsernameCiphertext) throw new Error("A configuração SMTP está incompleta.");
  const transporter = nodemailer.createTransport({ host: setting.smtpHost, port: setting.smtpPort, secure: setting.smtpPort === 465, auth: { user: decryptCredential(setting.smtpUsernameCiphertext), pass: decryptCredential(setting.secretCiphertext) } });
  await transporter.sendMail({ from, to: recipient, replyTo: setting.replyToEmail || undefined, subject, html });
}

export async function sendConfiguredTransactionalEmail(input: { event: EmailEvent; recipient: string; subject: string; html: string }) {
  const resend = await getPrivateEmailDeliverySetting("resend");
  const smtp = await getPrivateEmailDeliverySetting("smtp");
  const setting = resend?.isEnabled ? resend : smtp?.isEnabled ? smtp : undefined;
  if (!setting) return { sent: false, reason: "not-configured" as const };
  let notifications: Partial<Record<EmailEvent, boolean>> = {};
  try { notifications = JSON.parse(setting.notificationsJson) as Partial<Record<EmailEvent, boolean>>; } catch { return { sent: false, reason: "invalid-preferences" as const }; }
  if (!notifications[input.event]) return { sent: false, reason: "disabled" as const };
  await deliverWithSetting(setting, input.recipient, input.subject, input.html);
  return { sent: true, provider: setting.provider };
}

export async function sendEmailConnectionTest(input: { provider: "resend" | "smtp"; recipient: string }) {
  const setting = await getPrivateEmailDeliverySetting(input.provider);
  if (!setting?.isEnabled) throw new Error("Configure e salve este provedor antes de enviar um teste.");
  const subject = "Teste de integração de e-mail — Prime Frango Assado";
  const html = "<p>Esta é uma mensagem de teste da integração de e-mail da Prime Frango Assado.</p><p>Se você recebeu este e-mail, a configuração foi concluída com sucesso.</p>";
  await deliverWithSetting(setting, input.recipient, subject, html);
  return { provider: input.provider };
}
