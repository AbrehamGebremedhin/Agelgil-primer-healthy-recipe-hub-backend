import Joi from "joi";
import { IUserSignUpFrom, IUserLogInFrom, IUserUpdateFrom, EChronicDisease, EDietaryPreferences } from "./user.type";


export const userSignUpSchema = Joi.object<IUserSignUpFrom>({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    phone_number: Joi.string().required(),
    profile_img: Joi.string().optional(),
    medical_condition: Joi.object({
        chronicDiseases: Joi.array().items(Joi.string().valid(...Object.values(EChronicDisease)).required()).required(),
        dietary_preferences: Joi.array().items(Joi.string().valid(...Object.values(EDietaryPreferences)).required()).required(),
    }).required(),
});

export const userLogInSchema = Joi.object<IUserLogInFrom>({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

export const userUpdateSchema = Joi.object<IUserUpdateFrom>({
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    phone_number: Joi.string().optional(),
    password: Joi.string().min(8).optional(),
    email: Joi.string().email().optional(),
    profile_img: Joi.string().optional(),
    medical_condition: Joi.object({
        chronicDiseases: Joi.array().items(Joi.string().valid(...Object.values(EChronicDisease)).optional()),
        dietary_preferences: Joi.array().items(Joi.string().valid(...Object.values(EDietaryPreferences)).optional()),
    }).optional(),
});



