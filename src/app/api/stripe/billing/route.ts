import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import {
  stripe,
  createOrRetrieveCustomer,
  StripeError,
} from "@/lib/stripe/config";

export async function GET() {
  try {
    // Authenticate user
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create customer
    const customer = await createOrRetrieveCustomer(
      userId,
      user.emailAddresses[0]?.emailAddress || "",
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || undefined,
    );

    // Get customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      expand: ["data.default_payment_method"],
    });

    // Get customer's payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: "card",
    });

    // Get customer's invoices
    const invoices = await stripe.invoices.list({
      customer: customer.id,
      limit: 10,
    });

    // Format response
    const subscription = subscriptions.data[0]
      ? {
          id: subscriptions.data[0].id,
          status: subscriptions.data[0].status,
          current_period_start: subscriptions.data[0].current_period_start,
          current_period_end: subscriptions.data[0].current_period_end,
          cancel_at_period_end: subscriptions.data[0].cancel_at_period_end,
          trial_end: subscriptions.data[0].trial_end,
          product: {
            id: subscriptions.data[0].items.data[0].price.product as string,
            name:
              subscriptions.data[0].items.data[0].price.product === "prod_pro"
                ? "Pro"
                : "Enterprise",
          },
          price: {
            id: subscriptions.data[0].items.data[0].price.id,
            unit_amount: subscriptions.data[0].items.data[0].price.unit_amount,
            currency: subscriptions.data[0].items.data[0].price.currency,
            interval:
              subscriptions.data[0].items.data[0].price.recurring?.interval ||
              "month",
          },
        }
      : null;

    const customerData = {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      invoice_settings: {
        default_payment_method:
          customer.invoice_settings.default_payment_method,
      },
    };

    return NextResponse.json({
      subscription,
      customer: customerData,
      paymentMethods: paymentMethods.data,
      invoices: invoices.data,
    });
  } catch (error) {
    console.error("Billing data error:", error);

    if (error instanceof StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch billing data" },
      { status: 500 },
    );
  }
}
