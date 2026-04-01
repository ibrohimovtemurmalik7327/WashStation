const ERROR_STATUS = {

    // -------- COMMON --------
    VALIDATION_ERROR: 400,
    BAD_REQUEST: 400,

    UNAUTHORIZED: 401,

    FORBIDDEN: 403,

    NOT_FOUND: 404,

    CONFLICT: 409,

    INTERNAL_ERROR: 500,


    // -------- USER --------
    USER_NOT_FOUND: 404,
    USERNAME_CONFLICT: 409,
    PHONE_CONFLICT: 409,
    INCORRECT_PASSWORD: 400,
    USER_INACTIVE: 403,


    // -------- BRANCH --------
    BRANCH_NOT_FOUND: 404,
    BRANCH_PHONE_CONFLICT: 409,
    BRANCH_INACTIVE: 403,
    BRANCH_ALREADY_INACTIVE: 409


    // Keyinchalik boshqa module errorlari ham qo‘shiladi
};

const sendResponse = (res, result, successStatus = 200) => {

    if (!result || !result.success) {

        const errorCode = result?.error || 'INTERNAL_ERROR';

        const status = ERROR_STATUS[errorCode] || 500;

        return res.status(status).json({
            success: false,
            error: errorCode,
            data: result?.data || {}
        });
    }

    return res.status(successStatus).json({
        success: true,
        data: result.data ?? {}
    });
};

module.exports = sendResponse;