const Joi = require("joi");

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().max(64).required(),
        price: Joi.number().precision(2).positive().required(),
        // image: Joi.string().uri().max(256).required(),
        location: Joi.string().max(64).required(),
        description: Joi.string().max(1024).required()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        body: Joi.string().max(8096).required()
    }).required()
})
