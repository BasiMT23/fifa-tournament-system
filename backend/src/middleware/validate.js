import Joi from 'joi';

// Returns middleware that validates req.body against a Joi schema.
export const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(422).json({
      error: 'Validation failed',
      details: error.details.map(d => d.message),
    });
  }
  req.body = value;
  next();
};