import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";

// Routes Import
import authRouter        from "./routes/authRoutes.js";
import adminRouter       from "./routes/adminRoutes.js";
import destinationRouter from "./routes/destinationRoutes.js";
import packageRouter     from "./routes/packageRoutes.js";
import bookingRouter     from "./routes/bookingRoutes.js";
import reviewRouter      from "./routes/reviewRoutes.js";
import paymentRoutes     from "./routes/paymentRoutes.js";

const app  = express();
const port = process.env.PORT || 3000;

// ── MongoDB Connect
connectDB();

// ── Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ['https://golden-fairy-7c23fe.netlify.app'],
    credentials: true,
  })
);


app.get("/", (req, res) => {
  res.json({
    message: "Tourist Management System API is Live!",
    status: "OK",
    version: "1.0.0",
    endpoints: {
      auth:         "/api/auth",
      admin:        "/api/admin",
      destinations: "/api/destinations",
      packages:     "/api/packages",
      bookings:     "/api/bookings",
      reviews:      "/api/reviews",
    },
  });
});


app.use("/api/auth",         authRouter);
app.use("/api/admin",        adminRouter);
app.use("/api/destinations", destinationRouter);
app.use("/api/packages",     packageRouter);
app.use("/api/bookings",     bookingRouter);
app.use("/api/reviews",      reviewRouter);
app.use('/api/payments', paymentRoutes);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server error",
  });
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});