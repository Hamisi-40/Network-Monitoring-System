import { getAllPackages, createNewPackage, updateExistingPackage, deactivateExistingPackage} from "../services/package.service.js";

export const getPackages = async (req, res) => {
    try {
        const packages = await getAllPackages();

        res.status(200).json({
            success: true,
            data: packages
        });
    } catch (error) {
        console.error("Error fetching packages:", error);


        res.status(500).json({
            success: false,
            message: "Failed to fetch packages"
        });
    }
};

export const createPackage = async (req, res) => {
    try {
        const { name, price, duration, durationUnit } = req.body;

        const newPackage = await createNewPackage({
            name, price, duration, durationUnit
        });

        res.status(201).json({
            success: true,
            message: "Package created successfully",
            data: newPackage
        });
    } catch (error) {
        console.error("Error creating package:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create package"
        });
    }
};

export const updatePackage = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name, price, duration, durationUnit
        } = req.body;

        const updatedPackage = await updateExistingPackage(
            id, {
                name, price, duration, durationUnit
            }
        );

        res.status(200).json({
            success: true,
            message: "Package updated successfully",
            data: updatedPackage
        });
    } catch (error) {
        console.error("Error updating package:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update package"
        });
    }
};
    
export const deactivatePackage = async (req, res) => {
    try {
        const { id } = req.params;

        const deactivatedPackage = await deactivateExistingPackage(id);

        res.status(200).json({
            success: true,
            message: "Package deactivated successfully",
            data: deactivatedPackage
        });
    } catch (error) {
        console.error("Error deactivating package:", error);

        res.status(500).json({
            success: false,
            message: "Failed to deactivate package"
        });
    }
};