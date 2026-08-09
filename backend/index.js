// Load environment variables FIRST
import "dotenv/config";

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PORT } from './src/constants.js';
import { connectDB } from './src/database/database.js';
import packageRoutes from './src/routes/public/package.routes.js';

// Import customer payment routes
import publicPaymentRoutes from "./src/routes/public/payment.routes.js";

// Import public package routes
import publicPackageRoutes from './src/routes/public/package.routes.js';

// Import admin package routes
import adminPackagesRoutes from './src/routes/admin/package.route.js';

// Import admin payment routes
import adminPaymentRoutes from "./src/routes/admin/payment.route.js";

// Import public session routes
import publicSessionRoutes from "./src/routes/public/session.route.js";

const app = express();

//middlewares
app.use(cors());
app.use(express.json());

//Customer-facing package API
app.use('/api/public/packages', publicPackageRoutes);

//Admin package API
app.use('/api/admin/packages', adminPackagesRoutes);

// Public payment APIs used by the captive portal
app.use("/api/public/payments", publicPaymentRoutes);

// Admin payment routes
app.use("/api/admin/payments", adminPaymentRoutes);

// Public session API
app.use("/api/public/sessions", publicSessionRoutes);

// Routes
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to Internet Monitoring System API is running!"
    });
});

connectDB();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });