import { MongoClient } from 'mongodb';
import neo4j from 'neo4j-driver';

const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/Agelgel';
const dbName = 'Agelgel';
const client = new MongoClient(mongoUri);

const neo4jDriver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('username', 'password'));
const neo4jSession = neo4jDriver.session();

async function fetchDataAndCreateNodes() {
  try {
    await client.connect();
    const db = client.db(dbName);

    // Fetch data from MongoDB
    const users = await db.collection('users').find().toArray();
    const medicalConditions = await db.collection('medicalConditions').find().toArray();
    const recipes = await db.collection('recipes').find().toArray();
    const ingredients = await db.collection('ingredients').find().toArray();

    // Create nodes and relationships in Neo4j
    for (const user of users) {
      await neo4jSession.run(`
        MERGE (u:User {id: $id})
        SET u.name = $name
      `, { id: user._id.toString(), name: user.name });

      for (const conditionId of user.medicalConditionIds) {
        await neo4jSession.run(`
          MATCH (u:User {id: $userId}), (mc:MedicalCondition {id: $conditionId})
          MERGE (u)-[:HAS_CONDITION]->(mc)
        `, { userId: user._id.toString(), conditionId: conditionId.toString() });
      }
    }

    for (const condition of medicalConditions) {
      await neo4jSession.run(`
        MERGE (mc:MedicalCondition {id: $id})
        SET mc.name = $name
      `, { id: condition._id.toString(), name: condition.name });
    }

    for (const recipe of recipes) {
      await neo4jSession.run(`
        MERGE (r:Recipe {id: $id})
        SET r.name = $name, r.rating = $rating, r.calories = $calories, r.preferredMealTime = $preferredMealTime
      `, {
        id: recipe._id.toString(),
        name: recipe.name,
        rating: recipe.rating,
        calories: recipe.calories,
        preferredMealTime: recipe.preferredMealTime
      });

      for (const ingredientId of recipe.ingredientIds) {
        await neo4jSession.run(`
          MATCH (r:Recipe {id: $recipeId}), (i:Ingredient {id: $ingredientId})
          MERGE (r)-[:CONTAINS]->(i)
        `, { recipeId: recipe._id.toString(), ingredientId: ingredientId.toString() });
      }
    }

    for (const ingredient of ingredients) {
      await neo4jSession.run(`
        MERGE (i:Ingredient {id: $id})
        SET i.name = $name
      `, { id: ingredient._id.toString(), name: ingredient.name });
    }
  } finally {
    await client.close();
    await neo4jSession.close();
    await neo4jDriver.close();
  }
}

export { fetchDataAndCreateNodes };