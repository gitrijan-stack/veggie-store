// Thin client around Khalti's ePayment v2 API.
// Docs: /epayment/initiate/ and /epayment/lookup/
//
// Uses Node's built-in fetch (Node 18+). No extra HTTP dependency needed.

const KHALTI_BASE_URL = process.env.KHALTI_BASE_URL || "https://dev.khalti.com/api/v2/";
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;

const khaltiRequest = async (path, payload) => {
  if (!KHALTI_SECRET_KEY) {
    throw new Error("KHALTI_SECRET_KEY is not configured on the server");
  }

  const response = await fetch(`${KHALTI_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    // Khalti's error payloads are shaped like { field: ["message"], error_key }
    // or { detail: "message" } — flatten whichever one we got.
    const firstFieldError = Object.values(data).find((v) => Array.isArray(v))?.[0];
    const message = data.detail || firstFieldError || "Khalti request failed";
    throw new Error(message);
  }

  return data;
};

// POST /epayment/initiate/ — kicks off a payment, returns { pidx, payment_url, expires_at, expires_in }
export const khaltiInitiate = (payload) => khaltiRequest("epayment/initiate/", payload);

// POST /epayment/lookup/ — the only source of truth for whether a payment actually went through.
// Returns { pidx, total_amount, status, transaction_id, fee, refunded }
export const khaltiLookup = (pidx) => khaltiRequest("epayment/lookup/", { pidx });
