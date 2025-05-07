const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API } = process.env;

async function generateAccessToken() {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
  ).toString("base64");
  const response = await axios.post(
    `${PAYPAL_API}/v1/oauth2/token`,
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return response.data.access_token;
}

router.post("/create-order", async (req, res) => {
  try {
    const accessToken = await generateAccessToken();
    const order = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: req.body.amount || "10.00",
            },
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ id: order.data.id });
  } catch (err) {
    console.error("Error creating PayPal order:", err.message);
    res
      .status(500)
      .json({ error: "Something went wrong while creating order" });
  }
});

router.post("/capture-order", async (req, res) => {
  const { orderID } = req.body;
  try {
    const accessToken = await generateAccessToken();

    const capture = await axios.post(
      `${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ status: capture.data.status, details: capture.data });
  } catch (err) {
    console.error("Error capturing PayPal order:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error("Error message:", err.message);
    }
    res.status(500).json({ error: "Failed to capture order" });
  }
});

module.exports = router;
