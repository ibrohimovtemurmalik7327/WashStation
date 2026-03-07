const ERROR_STATUS = {
    VALIDATION_ERROR: 400,
    INCORRECT_OLD_PASSWORD: 400,
    INVALID_CODE: 400,
    INVALID_TICKET_TYPE: 400,
    PASSWORD_NOT_UPDATED: 400,

    UNAUTHORIZED: 401,
    FORBIDDEN: 403,

    NOT_FOUND: 404,
    USER_NOT_FOUND: 404,
    TICKET_NOT_FOUND: 404,

    CONFLICT: 409,
    PHONE_ALREADY_USED: 409,
    ACTIVE_TICKET_EXISTS: 409,
    TICKET_NOT_PENDING: 409,

    EXPIRED: 410,
    TICKET_EXPIRED: 410,

    TOO_MANY_ATTEMPTS: 429,

    INTERNAL_ERROR: 500,
    INTERNAL: 500
};

const sendResponse = (res, result, successStatus = 200) => {
    if (!result?.success) {
        const status = ERROR_STATUS[result?.code] || 500;
        return res.status(status).json(result);
    }

    if (successStatus === 204) {
        return res.sendStatus(204);
    }

    return res.status(successStatus).json(result);
};

module.exports = { sendResponse };