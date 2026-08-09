// Import Express Router
import { Router } from "express";

// Import admin package controller
import { createPackage, updatePackage, deletePackage } from "../../controllers/admin/package.controller.js";

const router = Router();

// Admin can create packages
router.post("/", createPackage);

//Admin can update a package
router.patch('/:id', updatePackage);

//Admin can delete a package
router.delete('/:id', deletePackage);

export default router;