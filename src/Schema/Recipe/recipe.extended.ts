import mongoose from "mongoose";
import Joi from "joi";
import { ValidationErrorFactory, errorFactory, isValidationError } from "../../Types/error"
import { BSONError } from 'bson';
import { MakeValidator } from "../../Util";
import { IRecipe } from "./recipe.type";



export function validator<T>(recipeInput: T, schema: Joi.ObjectSchema<T>) {
    return MakeValidator<T>(schema, recipeInput);
}

export async function getById(this: mongoose.Model<IRecipe>, _id: string): Promise<IRecipe> {
    try {
        const recipe = await this.findById(new mongoose.Types.ObjectId(_id));
        if (recipe == null) {
            throw ValidationErrorFactory({
                msg: "recipe not found",
                statusCode: 404,
                type: "Validation"
            }, "_id")
        }
        return recipe;
    } catch (error) {
        if (error instanceof BSONError) {
            throw ValidationErrorFactory({
                msg: "Input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
                statusCode: 400,
                type: "validation",
            }, "id");
        }
        throw error;
    }

}

export async function removeByID(this: mongoose.Model<IRecipe>, _id: string): Promise<void> {
    try {
        const result = await this.deleteOne({ _id: new mongoose.Types.ObjectId(_id) })
        if (result.deletedCount === 0) {
            throw ValidationErrorFactory({
                msg: "recipe not found",
                statusCode: 404,
                type: "Validation"
            }, "_id")
        }
    } catch (error) {
        if (error instanceof BSONError) {
            throw ValidationErrorFactory({
                msg: "Input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
                statusCode: 400,
                type: "validation",
            }, "id");
        }
        throw error;
    }
}

// export async function update(this: mongoose.Model<IRecipe>, _id: string, newrecipe: IRecipeUpdateFrom, populatePath?: string | string[]): Promise<IRecipe | null> {

// }