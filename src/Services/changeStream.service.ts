import { MongoClient } from 'mongodb';
import neo4j from 'neo4j-driver';

const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/Agelgel';
const dbName = 'Agelgel';
const client = new MongoClient(mongoUri);

const neo4jDriver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('username', 'password'));
const neo4jSession = neo4jDriver.session();

async function createOrUpdateNode(label: string, properties: any) {
  const query = `
    MERGE (n:${label} {id: $id})
    SET n += $properties
  `;
  await neo4jSession.run(query, { id: properties.id, properties });
}

async function watchCollection(collectionName: string, label: string) {
  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  const changeStream = collection.watch();

  changeStream.on('change', async (change) => {
    if (change.operationType === 'insert' || change.operationType === 'update') {
      const document = change.fullDocument || (change as any).updateDescription?.updatedFields;
      await createOrUpdateNode(label, { id: document._id.toString(), ...document });
    }
  });
}

async function startChangeStreams() {
  await client.connect();
  await watchCollection('users', 'User');
  await watchCollection('medicalConditions', 'MedicalCondition');
  await watchCollection('recipes', 'Recipe');
  await watchCollection('ingredients', 'Ingredient');
}

export { startChangeStreams };