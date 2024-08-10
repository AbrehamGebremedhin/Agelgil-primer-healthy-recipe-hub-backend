import express, { Request, Response } from "express";
import { MakeErrorHandler, moderatorOnly } from "../../Util/middlewares";
import moderatorController from "./moderator.controller";
import { IModerator } from "../../Schema/Moderator/moderator.type";


const publicModeratorRouter = express.Router();
const privateModeratorRouter = express.Router();

privateModeratorRouter.get("/", moderatorOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _moderator: IModerator = req['moderator'];
        res.json(await moderatorController.getById(_moderator._id as any));
    }
));

privateModeratorRouter.patch("/update", moderatorOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _moderator: IModerator = req['moderator'];
        res.json(await moderatorController.update(req.body, _moderator.id));
    }
));

publicModeratorRouter.get("/id/:id", MakeErrorHandler(
    async (req: Request, res: Response) => {
        res.json(await moderatorController.getById(req.params.id));
    }
));

privateModeratorRouter.patch("/updateRecipeStatus/:recipeId", moderatorOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _moderator: IModerator = req['moderator'];
        const recipeId = req.params.recipeId;
        res.json(await moderatorController.updateRecipeStatus(recipeId, req.body, _moderator._id as any));
    }
));

publicModeratorRouter.use("/moderator", publicModeratorRouter);
privateModeratorRouter.use("/moderator", privateModeratorRouter);


export { publicModeratorRouter, privateModeratorRouter } 