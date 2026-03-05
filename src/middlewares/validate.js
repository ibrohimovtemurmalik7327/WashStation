const validate = (schema, property = 'body') => (req, res, next) => {
    const { error, value } = schema.validate(req[property]);

    if(error) {
        return res.status(400).json({
            message: error.details?.[0].message || 'Validation error'
        });
    };

    req[property] = value;

    next();
};

module.exports = { validate };