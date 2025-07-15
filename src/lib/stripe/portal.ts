import { stripe, createOrRetrieveCustomer } from "./config";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function getBillingPortalUrl(): Promise<string> {
  try {
    // Get current user
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      throw new Error("User not authenticated");
    }

    // Create or retrieve customer
    const customer = await createOrRetrieveCustomer(
      userId,
      user.emailAddresses[0]?.emailAddress || "",
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || undefined,
    );

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard`,
    });

    return session.url;
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    throw new Error("Failed to create billing portal session");
  }
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<string> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    throw new Error("Failed to create billing portal session");
  }
}
