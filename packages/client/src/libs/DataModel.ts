import { DMMF } from '@prisma/generator-helper'
import { SBPrismaError } from './SBPrismaError'

export class DataModel {
  cache: Map<string, Model> = new Map()

  constructor(public dataModel: DMMF.Datamodel) {}

  public model(key: string) {
    const cache = this.cache.get(key)
    if (cache) return cache

    const model = this.dataModel.models.find(({ name }) => name === key)
    if (!model)
      throw new SBPrismaError(
        `Model (${key}) does not exist in dmmf.datamodel.models.`,
      )

    const m = new Model(model)
    this.cache.set(key, m)
    return m
  }
}

class Model {
  cache: Map<string, DMMF.Field> = new Map()

  constructor(public model: DMMF.Model) {}

  get table() {
    return this.model.dbName ?? this.model.name
  }

  get fields() {
    return this.model.fields
  }

  public field(key: string) {
    const cache = this.cache.get(key)
    if (cache) return cache

    const field = this.model.fields.find(({ name }) => name === key)
    if (!field)
      throw new SBPrismaError(
        `Field (${key}) does not exist in dmmf.datamodel.models.[].fields`,
      )

    this.cache.set(key, field)
    return field
  }
}
