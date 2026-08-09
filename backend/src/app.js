import express from "express";
import cors from "cors";

// Routes
import packageRoutes from "./routes/package.routes.js";
import adminPackageRoutes from "./routes/admin.package.routes.js";
import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import accessRoutes from "./routes/access.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import adminCustomerRoutes from "./routes/admin.customer.routes.js";
import adminPaymentRoutes from "./routes/admin.payment.routes.js";
import adminSubscriptionRoutes from "./routes/admin.subscription.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/packages", packageRoutes);
app.use("/api/admin/packages", adminPackageRoutes);
app.use("/api/admin/auth", authRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);
app.use("/api/admin/subscriptions", adminSubscriptionRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "internet-monitoring-system backend is running successfully",
    });
});

export default app;