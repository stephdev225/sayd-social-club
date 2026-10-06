#!/usr/bin/env node
/**
 * Creates the two Québec tax rates in YOUR Stripe account (run once per mode: test, then live).
 * Prints the ids to put in STRIPE_TAX_RATE_GST / STRIPE_TAX_RATE_QST.
 * Usage: node scripts/create-tax-rates.mjs
 */
import { existsSync } from "node:fs";
import Stripe from "stripe";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY missing.");
  process.exit(1);
}
const stripe = new Stripe(key);
const mode = key.startsWith("sk_live_") ? "LIVE" : "TEST";

const gst = await stripe.taxRates.create({
  display_name: "TPS/GST",
  percentage: 5,
  inclusive: false,
  country: "CA",
  jurisdiction: "CA",
  tax_type: "gst",
});
const qst = await stripe.taxRates.create({
  display_name: "TVQ/QST",
  percentage: 9.975,
  inclusive: false,
  country: "CA",
  state: "QC",
  jurisdiction: "QC",
  tax_type: "qst",
});
console.log(`[${mode}] Add to your environment:`);
console.log(`STRIPE_TAX_RATE_GST=${gst.id}`);
console.log(`STRIPE_TAX_RATE_QST=${qst.id}`);
