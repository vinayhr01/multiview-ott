const Joi = require("joi");

exports.registerMiddleware = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().min(1).required(), // Valid email format
      password: Joi.string().min(6).required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    next();

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Something went wrong in register " + err,
    });
  }
};