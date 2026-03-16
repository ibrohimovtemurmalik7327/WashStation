const ERROR_STATUS = {
    // 400 Bad Request
    VALIDATION_ERROR: 400,
    INCORRECT_OLD_PASSWORD: 400,
    INVALID_CODE: 400,
    INVALID_TICKET_TYPE: 400,
    PASSWORD_NOT_UPDATED: 400,
    INVALID_TIME_RANGE: 400,
    MACHINE_BRANCH_MISMATCH: 400,
    BOOKING_CANNOT_BE_CANCELLED: 400,
    INVALID_STATUS_TRANSITION: 400,

    // 401 Unauthorized
    UNAUTHORIZED: 401,

    // 403 Forbidden
    FORBIDDEN: 403,

    // 404 Not Found
    NOT_FOUND: 404,
    USER_NOT_FOUND: 404,
    TICKET_NOT_FOUND: 404,
    BRANCH_NOT_FOUND: 404,
    MACHINE_NOT_FOUND: 404,
    BOOKING_NOT_FOUND: 404,

    // 409 Conflict
    CONFLICT: 409,
    PHONE_ALREADY_USED: 409,
    ACTIVE_TICKET_EXISTS: 409,
    TICKET_NOT_PENDING: 409,
    TIME_CONFLICT: 409,

    // 410 Gone
    EXPIRED: 410,
    TICKET_EXPIRED: 410,

    // 429 Too Many Requests
    TOO_MANY_ATTEMPTS: 429,

    // 500 Internal Server Error
    INTERNAL_ERROR: 500,
    INTERNAL: 500
};

const sendResponse = (res, result, successStatus = 200) => {
    if (!result?.success) {
        const status = ERROR_STATUS[result?.error] || 500;
        return res.status(status).json(result);
    }

    if (successStatus === 204) {
        return res.sendStatus(204);
    }

    return res.status(successStatus).json(result);
};

module.exports = { sendResponse };