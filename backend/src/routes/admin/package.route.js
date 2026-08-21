// Import Express Router
import { Router } from "express";

// Import admin package controller
import { createPackage, updatePackage, deletePackage, getAllPackages, changePackageStatus, schedulePackage } from "../../controllers/admin/package.controller.js";

// Import admin authentication middleware
import { adminAuth } from "../../middlewares/adminAuth.middleware.js";

const router = Router();

// Every route below this line requires a valid admin JWT
router.use(adminAuth);

// Admin can create packages
router.post("/", createPackage);

//Admin can update a package
router.patch('/:id', updatePackage);

//Admin can delete a package
router.delete('/:id', deletePackage);

// Admin views all packages
router.get("/", getAllPackages);

// Admin enables or disables a package
router.patch("/:id/status", changePackageStatus);

// Admin sets temporary availability period
router.patch("/:id/schedule", schedulePackage);

export default router;