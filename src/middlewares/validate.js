const validate = (schema, property = 'body') => {
    return (req, res, next) => {

        const { error, value } = schema.validate(req[property] || {}, {
            abortEarly: true,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_ERROR',
                data: {
                    message: error.details?.[0]?.message || 'Validation error'
                }
            });
        }

        req[property] = value;

        next();
    };
};

module.exports = { validate };