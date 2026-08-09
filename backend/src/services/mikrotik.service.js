export const authorizeDevice = async ({
     deviceMac,
     endTime
}) => {
    console.log("MikroTik authorization requested");

    console.log({
        deviceMac,
        endTime
    });

    // DEMO MODE
    // Later this will communicate with the real MikroTik router.

    return {
        success: true,
        deviceMac,
        authorizedUntil: endTime,
        message: "Device authorized successfully"
    };
};