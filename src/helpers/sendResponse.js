const ERROR_STATUS = {
    VALIDATION_ERROR: 400,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,

    USER_NOT_FOUND: 404,
    USERNAME_CONFLICT: 409,
    PHONE_CONFLICT: 409,
    INCORRECT_PASSWORD: 400,
    USER_INACTIVE: 403,

    BRANCH_NOT_FOUND: 404,
    BRANCH_PHONE_CONFLICT: 409,
    BRANCH_INACTIVE: 403,
    BRANCH_ALREADY_INACTIVE: 409,

    MACHINE_NOT_FOUND: 404,
    MACHINE_NAME_CONFLICT: 409,
    MACHINE_INACTIVE: 403,
    MACHINE_ALREADY_INACTIVE: 409
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