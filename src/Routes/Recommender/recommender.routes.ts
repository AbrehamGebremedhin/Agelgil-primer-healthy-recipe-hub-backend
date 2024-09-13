import express, { Request, Response } from 'express';
import { MakeErrorHandler, userOnly, moderatorOnly } from '../../Util/middlewares';
import { basicRecommender, calorieRecommender } from '../../Services/recommender.service';

const publicRecommenderRouter = express.Router();
const privateRecommenderRouter = express.Router();

// Basic recommender for public access
publicRecommenderRouter.get('/basic-recommender/:userId', MakeErrorHandler(
  async (req: Request, res: Response) => {
    const recommendations = await basicRecommender(req.params.userId);
    res.status(200).json(recommendations);
  }
));

// Calorie-based recommender for public access
publicRecommenderRouter.get('/calorie-recommender/:maxCalories', MakeErrorHandler(
  async (req: Request, res: Response) => {
    const recommendations = await calorieRecommender(parseInt(req.params.maxCalories, 10));
    res.status(200).json(recommendations);
  }
));

// Example of a private route for user-specific recommendations
privateRecommenderRouter.get('/user/basic-recommender/:userId', userOnly, MakeErrorHandler(
  async (req: any, res: Response) => {
    const recommendations = await basicRecommender(req.params.userId);
    res.status(200).json(recommendations);
  }
));

// Example of a private route for moderator-specific recommendations
privateRecommenderRouter.get('/moderator/basic-recommender/:userId', moderatorOnly, MakeErrorHandler(
  async (req: any, res: Response) => {
    const recommendations = await basicRecommender(req.params.userId);
    res.status(200).json(recommendations);
  }
));

export { publicRecommenderRouter, privateRecommenderRouter };