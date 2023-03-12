import * as shiftRepository from "../database/default/repository/shiftRepository";
import { Between, FindConditions, FindManyOptions, FindOneOptions, In } from "typeorm";
import moment from "moment";
import Shift from "../database/default/entity/shift";
import { ICreateShift, IPublishShift, IUpdateShift } from "../shared/interfaces";
import { findWeeklyShift } from "../shared/helper";

export const find = async (opts: FindManyOptions<Shift>): Promise<[Shift[], number]> => {
  return shiftRepository.find(opts);
};

export const findOne = async (opts: FindConditions<Shift>): Promise<Shift> => {
  return shiftRepository.findOne(opts);
};

export const findById = async (
  id: string,
  opts?: FindOneOptions<Shift>
): Promise<Shift> => {
  return shiftRepository.findById(id, opts);
};

export const create = async (payload: ICreateShift): Promise<Shift> => {
  const shift = new Shift();
  shift.name = payload.name;
  shift.date = payload.date;
  shift.startTime = payload.startTime;
  shift.endTime = payload.endTime;

  return shiftRepository.create(shift);
};

export const updateById = async (
  id: string,
  payload: IUpdateShift
): Promise<Shift> => {
  return shiftRepository.updateById(id, {
    ...payload,
  });
};

export const publishShiftByWeekId = async (
  payload: IPublishShift
): Promise<[Shift[], number]> => {
  const [firstDayOfWeek, lastDayOfWeek] = findWeeklyShift(moment.utc(payload.weekId).toDate())

  return shiftRepository.update(
    { 
      date: Between(firstDayOfWeek, lastDayOfWeek) 
    },
    {
      isPublished: true,
    });
};

export const deleteById = async (id: string | string[]) => {
  return shiftRepository.deleteById(id);
};
