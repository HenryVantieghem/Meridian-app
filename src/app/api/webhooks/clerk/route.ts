import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { syncUserFromClerk, handleUserDeletion, logSecurityEvent } from '@/lib/auth/clerk-config';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    logSecurityEvent('WEBHOOK_MISSING_HEADERS');
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    logSecurityEvent('WEBHOOK_VERIFICATION_FAILED', undefined, { error: err });
    return new Response('Error occured', {
      status: 400
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  if (!id) {
    logSecurityEvent('WEBHOOK_NO_USER_ID');
    return NextResponse.json(
      { error: 'No user ID in webhook data' },
      { status: 400 }
    );
  }

  logSecurityEvent(`WEBHOOK_${eventType.toUpperCase()}`, id);

  // Handle the webhook
  switch (eventType) {
    case 'user.created':
      try {
        await syncUserFromClerk(id);
        logSecurityEvent('USER_CREATED_SUCCESS', id);
      } catch (error) {
        logSecurityEvent('USER_CREATED_FAILED', id, { error });
        return NextResponse.json(
          { error: 'Failed to create user in database' },
          { status: 500 }
        );
      }
      break;
    
    case 'user.updated':
      try {
        await syncUserFromClerk(id);
        logSecurityEvent('USER_UPDATED_SUCCESS', id);
      } catch (error) {
        logSecurityEvent('USER_UPDATED_FAILED', id, { error });
        return NextResponse.json(
          { error: 'Failed to update user in database' },
          { status: 500 }
        );
      }
      break;
    
    case 'user.deleted':
      try {
        await handleUserDeletion(id);
        logSecurityEvent('USER_DELETED_SUCCESS', id);
      } catch (error) {
        logSecurityEvent('USER_DELETED_FAILED', id, { error });
        return NextResponse.json(
          { error: 'Failed to delete user from database' },
          { status: 500 }
        );
      }
      break;
    
    default:
      logSecurityEvent('WEBHOOK_UNKNOWN_EVENT', id, { eventType });
      break;
  }

  return NextResponse.json({ success: true });
} 