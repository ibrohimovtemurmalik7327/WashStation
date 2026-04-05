const ERROR_STATUS = {
    // Generic
    VALIDATION_ERROR: 400,
    BAD_REQUEST: 400,
    INVALID_INPUT: 400,
    INVALID_ID: 400,
    INVALID_PHONE: 400,
    INVALID_PASSWORD: 400,
    INVALID_OLD_PASSWORD: 400,
    INVALID_NEW_PASSWORD: 400,
    INVALID_ROLE: 400,
    INVALID_STATUS: 400,
    INVALID_COORDINATES: 400,
    INVALID_BRANCH_ID: 400,
    INVALID_MACHINE_ID: 400,
    INVALID_BOOKING_ID: 400,
    INVALID_START_TIME: 400,
    INVALID_BOOKING_TIME: 400,
    INVALID_WASH_MASS: 400,
    INVALID_CAPACITY: 400,
    INVALID_SLOT: 400,
    INVALID_CODE: 400,
    INVALID_TICKET_ID: 400,

    // Auth / Access
    UNAUTHORIZED: 401,
    TOKEN_MISSING: 401,
    TOKEN_INVALID: 401,
    TOKEN_EXPIRED: 401,
    AUTH_REQUIRED: 401,

    FORBIDDEN: 403,
    USER_INACTIVE: 403,
    BRANCH_INACTIVE: 403,
    MACHINE_INACTIVE: 403,

    // Not found
    NOT_FOUND: 404,
    USER_NOT_FOUND: 404,
    BRANCH_NOT_FOUND: 404,
    MACHINE_NOT_FOUND: 404,
    BOOKING_NOT_FOUND: 404,
    TICKET_NOT_FOUND: 404,

    // Conflict
    CONFLICT: 409,
    USERNAME_CONFLICT: 409,
    PHONE_CONFLICT: 409,
    BRANCH_PHONE_CONFLICT: 409,
    MACHINE_NAME_CONFLICT: 409,

    BRANCH_ALREADY_INACTIVE: 409,
    MACHINE_ALREADY_INACTIVE: 409,

    BOOKING_ALREADY_CANCELLED: 409,
    BOOKING_ALREADY_COMPLETED: 409,
    BOOKING_ALREADY_STARTED: 409,
    BOOKING_CANCELLED: 409,
    BOOKING_NOT_FINISHED_YET: 409,

    NO_ACTIVE_MACHINES: 409,
    NO_AVAILABLE_COMBINATION: 409,
    SLOT_ALREADY_TAKEN: 409,
    SLOT_NOT_AVAILABLE: 409,
    MACHINE_ALREADY_BOOKED: 409,

    ACTIVE_TICKET_EXISTS: 409,
    PHONE_ALREADY_USED: 409,
    USERNAME_ALREADY_USED: 409,
    TICKET_NOT_PENDING: 409,
    TICKET_EXPIRED: 409,
    TICKET_CONSUMED: 409,

    // Too many attempts / rate related
    TOO_MANY_ATTEMPTS: 429,
    RATE_LIMITED: 429,

    // Unprocessable / semantic errors
    INCORRECT_PASSWORD: 400,

    // Server
    INTERNAL_ERROR: 500,
    DB_ERROR: 500
};

const sendResponse = (res, result, successStatus = 200) => {
    if (!result || result.success !== true) {
        const errorCode = result?.error || 'INTERNAL_ERROR';
        const status = ERROR_STATUS[errorCode] || 500;

        return res.status(status).json({
            success: false,
            error: errorCode,
            data: result?.data ?? {}
        });
    }

    return res.status(successStatus).json({
        success: true,
        data: result?.data ?? {}
    });
};

module.exports = sendResponse;