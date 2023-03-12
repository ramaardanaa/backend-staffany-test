import {
  getRepository,
  FindManyOptions,
  FindOneOptions,
  FindConditions,
  DeleteResult,
  In,
} from "typeorm";
import moduleLogger from "../../../shared/functions/logger";
import Shift from "../entity/shift";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

const logger = moduleLogger("shiftRepository");

export const find = async (opts?: FindManyOptions<Shift>): Promise<[Shift[], number]> => {
  logger.info("Find");
  const repository = getRepository(Shift);
  const data = await repository.findAndCount(opts);
  return data;
};

export const findById = async (
  id: string,
  opts?: FindOneOptions<Shift>
): Promise<Shift> => {
  logger.info("Find by id");
  const repository = getRepository(Shift);
  const data = await repository.findOne(id, opts);
  return data;
};

export const findByIds = async (
  ids: string[],
  opts?: FindManyOptions<Shift>
): Promise<Shift[]> => {
  logger.info("Find by id");
  const repository = getRepository(Shift);
  const data = await repository.findByIds(ids, opts);
  return data;
};

export const findOne = async (
  where?: FindConditions<Shift>,
  opts?: FindOneOptions<Shift>
): Promise<Shift> => {
  logger.info("Find one");
  const repository = getRepository(Shift);
  const data = await repository.findOne(where, opts);
  return data;
};

export const create = async (payload: Shift): Promise<Shift> => {
  logger.info("Create");
  const repository = getRepository(Shift);
  const newdata = await repository.save(payload);
  return newdata;
};

export const updateById = async (
  id: string,
  payload: QueryDeepPartialEntity<Shift>
): Promise<Shift> => {
  logger.info("Update by id");
  const repository = getRepository(Shift);
  await repository.update(id, payload);
  return findById(id);
};

export const update = async (
  where: FindConditions<Shift>,
  payload: QueryDeepPartialEntity<Shift>
): Promise<[Shift[], number]> => {
  logger.info("Update by ids");
  const repository = getRepository(Shift);
  await repository.update(where, payload);

  return find({ where });
};

export const deleteById = async (
  id: string | string[]
): Promise<DeleteResult> => {
  logger.info("Delete by id");
  const repository = getRepository(Shift);
  return await repository.delete(id);
};