import { supabase } from "./supabase";
import { z } from "zod";
import { Email } from "@/types";
import { handleDatabaseError } from "./supabase";

export const EmailSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  external_id: z.string(),
  from_address: z.object({ name: z.string().optional(), email: z.string() }),
  to_addresses: z.array(
    z.object({ name: z.string().optional(), email: z.string() }),
  ),
  cc_addresses: z
    .array(z.object({ name: z.string().optional(), email: z.string() }))
    .optional(),
  bcc_addresses: z
    .array(z.object({ name: z.string().optional(), email: z.string() }))
    .optional(),
  subject: z.string(),
  body: z.string(),
  body_html: z.string().optional(),
  attachments: z
    .array(
      z.object({
        id: z.string(),
        filename: z.string(),
        contentType: z.string(),
        size: z.number(),
        url: z.string().optional(),
      }),
    )
    .optional(),
  received_at: z.string(),
  read: z.boolean().optional(),
  starred: z.boolean().optional(),
  archived: z.boolean().optional(),
  labels: z.array(z.string()).optional(),
  thread_id: z.string(),
  priority: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export async function getEmails(userId: string) {
  const { data, error } = await supabase
    .from("emails")
    .select("*")
    .eq("user_id", userId)
    .order("received_at", { ascending: false });
  if (error) handleDatabaseError(error);
  return data as Email[];
}

export async function getEmailById(userId: string, id: string) {
  const { data, error } = await supabase
    .from("emails")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .single();
  if (error) handleDatabaseError(error);
  return data as Email;
}

export async function createEmail(email: z.infer<typeof EmailSchema>) {
  const parsed = EmailSchema.parse(email);
  const { data, error } = await supabase
    .from("emails")
    .insert([parsed])
    .select()
    .single();
  if (error) handleDatabaseError(error);
  return data as Email;
}

export async function updateEmail(
  userId: string,
  id: string,
  updates: Partial<z.infer<typeof EmailSchema>>,
) {
  const { data, error } = await supabase
    .from("emails")
    .update(updates)
    .eq("user_id", userId)
    .eq("id", id)
    .select()
    .single();
  if (error) handleDatabaseError(error);
  return data as Email;
}

export async function deleteEmail(userId: string, id: string) {
  const { error } = await supabase
    .from("emails")
    .delete()
    .eq("user_id", userId)
    .eq("id", id);
  if (error) handleDatabaseError(error);
  return true;
}

// Real-time subscription for emails
export function subscribeToEmails(
  userId: string,
  callback: (emails: Email[]) => void,
) {
  return supabase
    .channel("emails")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "emails",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new ? [payload.new as Email] : []);
      },
    )
    .subscribe();
}
