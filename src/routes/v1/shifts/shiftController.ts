import { Request, ResponseToolkit } from "@hapi/hapi";
import { LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm'
import * as shiftUsecase from "../../../usecases/shiftUsecase";
import { errorHandler } from "../../../shared/functions/error";
import {
  ICreateShift,
  ISuccessResponse,
  IUpdateShift,
} from "../../../shared/interfaces";
import moduleLogger from "../../../shared/functions/logger";

const logger = moduleLogger("shiftController");

export const find = async (req: Request, h: ResponseToolkit) => {
  logger.info("Find shifts");
  try {
    const filter = req.query;
    const data = await shiftUsecase.find(filter);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Get shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};

export const findById = async (req: Request, h: ResponseToolkit) => {
  logger.info("Find shift by id");
  try {
    const id = req.params.id;
    const data = await shiftUsecase.findById(id);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Get shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};

export const create = async (req: Request, h: ResponseToolkit) => {
  logger.info("Create shift");
  try {
    const body = req.payload as ICreateShift;
    const isShiftAvailable = await shiftUsecase.find({
      where: [{
        date: body.date,
        startTime: LessThanOrEqual(body.startTime),
        endTime: MoreThanOrEqual(body.startTime)
      },
      {
        date: body.date,
        startTime: LessThanOrEqual(body.endTime),
        endTime: MoreThanOrEqual(body.endTime)
      }
      ]
    })

    if (isShiftAvailable.length) throw new Error(`shift on date ${isShiftAvailable[0].date} from ${isShiftAvailable[0].startTime} until ${isShiftAvailable[0].endTime} already exist`)

    const data = await shiftUsecase.create(body);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Create shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};

export const updateById = async (req: Request, h: ResponseToolkit) => {
  logger.info("Update shift by id");
  try {
    const id = req.params.id;
    const body = req.payload as IUpdateShift;

    const isShiftAvailable = await shiftUsecase.find({
      where: [{
        id: Not(id),
        date: body.date,
        startTime: LessThanOrEqual(body.startTime),
        endTime: MoreThanOrEqual(body.startTime)
      },
      {
        id: Not(id),
        date: body.date,
        startTime: LessThanOrEqual(body.endTime),
        endTime: MoreThanOrEqual(body.endTime)
      }]
    })

    if (isShiftAvailable.length) throw new Error(`shift on date ${isShiftAvailable[0].date} from ${isShiftAvailable[0].startTime} until ${isShiftAvailable[0].endTime} already exist`)


    const data = await shiftUsecase.updateById(id, body);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Update shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};

export const deleteById = async (req: Request, h: ResponseToolkit) => {
  logger.info("Delete shift by id");
  try {
    const id = req.params.id;
    const data = await shiftUsecase.deleteById(id);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Delete shift successful",
      results: data,
    };
    return res;
  } catch (error) {
    logger.error(error.message)
    return errorHandler(h, error);
  }
};
