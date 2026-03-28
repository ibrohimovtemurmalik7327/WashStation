const ERROR_STATUS = {
    USER_NOT_FOUND: 404,
    USERNAME_CONFLICT: 409,
    PHONE_CONFLICT: 409,
    INCORRECT_PASSWORD: 400,
    USER_INACTIVE: 403,
    CONFLICT: 409,
    VALIDATION_ERROR: 400,
    INTERNAL_ERROR: 500
};

const sendResponse = (res, result, successStatus = 200) => {
    if (!result.success) {
        const status = ERROR_STATUS[result.error] || 500;

        return res.status(status).json({
            success: false,
            error: result.error,
            data: result.data || {}
        });
    }

    return res.status(successStatus).json({
        success: true,
        data: result.data
    });
};

module.exports = sendResponse;