import neo4j from 'neo4j-driver';

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('username', 'password'));
const session = driver.session();

export async function basicRecommender(userId: string) {
  const result = await session.run(`
    MATCH (u:User)-[:HAS_CONDITION]->(mc:MedicalCondition)<-[:HAS_CONDITION]-(otherUsers:User)-[r:RATED]->(rec:Recipe)
    WHERE u.id = $userId AND r.rating >= 4
    RETURN rec
  `, { userId });

  return result.records.map(record => record.get('rec').properties);
}

export async function calorieRecommender(maxCalories: number) {
  const result = await session.run(`
    MATCH (r:Recipe)
    WHERE r.calories <= $maxCalories
    RETURN r.preferredMealTime, SUM(r.calories) AS totalCalories
  `, { maxCalories });

  return result.records.map(record => ({
    preferredMealTime: record.get('r.preferredMealTime'),
    totalCalories: record.get('totalCalories').low
  }));
}

export async function closeConnection() {
  await session.close();
  await driver.close();
}