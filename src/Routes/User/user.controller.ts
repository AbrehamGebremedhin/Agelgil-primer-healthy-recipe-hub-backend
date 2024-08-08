import { IUser, IUserLogInFrom, IUserSignUpFrom, IUserUpdateFrom } from "../../Schema/user/user.type";
import UserModel from "../../Schema/user/user.schema";
import { IListResponseType, IPagination, IResponseType, IResponseWithHeaderType } from "../../Types";
import { MakeTokens, removeRefreshToken, verifyAccessToken, verifyRefreshToken } from "../../Util/jwt";
import { UserType } from "../../Util/jwt/jwt.types";
import { userLogInSchema, userSignUpSchema, userUpdateSchema } from "../../Schema/user/user.validation";
import { IRecipe } from "../../Schema/Recipe/recipe.type";


export default class UserController {

    static async signUp(_user: IUserSignUpFrom): Promise<IResponseWithHeaderType<IUser>> {

        await UserModel.validator(_user, userSignUpSchema)
        const user = await new UserModel((_user as any));
        await user!.encryptPassword();
        await user.save();
        const { accessToken, refreshToken } = await MakeTokens(user.toJSON(), UserType.user);

        return { body: user.toJSON(), header: { accessToken, refreshToken } }
    }

    static async logIn(from: IUserLogInFrom): Promise<IResponseWithHeaderType<IUser>> {
        await UserModel.validator(from, userLogInSchema);
        const user = await UserModel.getByEmail(from.email);
        await user!.checkPassword(from.password);

        const { accessToken, refreshToken } = await MakeTokens(user!.toJSON(), UserType.user);
        return { body: user!.toJSON(), header: { accessToken, refreshToken } }

    }

    static async refreshToken(_refreshToken: string): Promise<IResponseWithHeaderType<undefined>> {

        const tokenUser = await verifyRefreshToken<IUser>(_refreshToken, UserType.user);
        const user = await UserModel.getById(tokenUser!.id);
        const { accessToken, refreshToken } = await MakeTokens(user!.toJSON(), UserType.user);

        return { body: undefined, header: { accessToken, refreshToken } }
    }

    static async logOut(token: string): Promise<void> {
        const user = await verifyAccessToken<IUser>(token, UserType.user);
        await removeRefreshToken(user.id);
    }

    static async update(_user: IUserUpdateFrom, userId: string): Promise<IResponseType<IUser | null>> {

        await UserModel.validator(_user, userUpdateSchema)
        const user = await UserModel.getById(userId);
        const updateUser = await UserModel.update(user.id, _user)
        return { body: (updateUser as any).toJSON() }
    }

    static async getById(userId: string = ""): Promise<IResponseType<IUser | null>> {
        return { body: ((await UserModel.getById(userId))?.toJSON() as any) };
    }

    static async removeById(userId: string, user: IUser): Promise<IResponseType<{} | null>> {
        const event = await UserModel.getById(userId);
        await UserModel.removeByID(event?.id)

        return { body: {} };

    }

    static async bookedRecipes(userId: string, pagination: IPagination): Promise<IResponseType<IRecipe[]>> {
        return { body: await UserModel.getBookedRecipes(userId, pagination) };
    }

    static async bookRecipeToggle(userId: string, recipeId: string): Promise<IResponseType<IRecipe[]>> {
        return { body: await UserModel.bookRecipeToggle(userId, recipeId) };
    }
}