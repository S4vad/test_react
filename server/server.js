import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const app = express();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(
  cors({
    origin: process.env.BACK_END_URL,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "usd",
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.listen(5000, () => console.log("server runnign on port sucess"));
