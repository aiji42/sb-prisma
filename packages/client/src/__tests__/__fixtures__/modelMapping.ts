export const operationMapping = {
  aggregateUser: { model: 'User', method: 'aggregate' },
  createManyUser: { model: 'User', method: 'createMany' },
  createOneUser: { model: 'User', method: 'createOne' },
  deleteManyUser: { model: 'User', method: 'deleteMany' },
  deleteOneUser: { model: 'User', method: 'deleteOne' },
  findFirstUser: { model: 'User', method: 'findFirst' },
  findManyUser: { model: 'User', method: 'findMany' },
  findUniqueUser: { model: 'User', method: 'findUnique' },
  groupByUser: { model: 'User', method: 'groupBy' },
  updateManyUser: { model: 'User', method: 'updateMany' },
  updateOneUser: { model: 'User', method: 'updateOne' },
  upsertOneUser: { model: 'User', method: 'upsertOne' },
  aggregateTeam: { model: 'Team', method: 'aggregate' },
  createManyTeam: { model: 'Team', method: 'createMany' },
  createOneTeam: { model: 'Team', method: 'createOne' },
  deleteManyTeam: { model: 'Team', method: 'deleteMany' },
  deleteOneTeam: { model: 'Team', method: 'deleteOne' },
  findFirstTeam: { model: 'Team', method: 'findFirst' },
  findManyTeam: { model: 'Team', method: 'findMany' },
  findUniqueTeam: { model: 'Team', method: 'findUnique' },
  groupByTeam: { model: 'Team', method: 'groupBy' },
  updateManyTeam: { model: 'Team', method: 'updateMany' },
  updateOneTeam: { model: 'Team', method: 'updateOne' },
  upsertOneTeam: { model: 'Team', method: 'upsertOne' },
}

export const relationMapping = {
  User: { Team: 'Team' },
  Team: { users: 'User' },
}

export const tableMapping = { User: 'User', Team: '_team' }
