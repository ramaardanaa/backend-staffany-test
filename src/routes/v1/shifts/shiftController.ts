import { Request, ResponseToolkit } from "@hapi/hapi";
import { Between, Equal, LessThan, MoreThan, Not } from 'typeorm';
import moment from 'moment';
import * as shiftUsecase from "../../../usecases/shiftUsecase";
import { errorHandler } from "../../../shared/functions/error";
import {
  ICreateShift,
  IPublishShift,
  ISuccessResponse,
  IUpdateShift
} from "../../../shared/interfaces";
import moduleLogger from "../../../shared/functions/logger";
import { HttpError } from "../../../shared/classes/HttpError";
import { findWeeklyShift } from "../../../shared/helper";

const logger = moduleLogger("shiftController");

const isShiftPublished = async (weekId: Date) => {
  const [firstDayOfWeek, lastDayOfWeek]: String[] = findWeeklyShift(weekId) 

  const [data] = await shiftUsecase.find({
    where: {
      date: Between(firstDayOfWeek, lastDayOfWeek),
      isPublished: true
    }
  });

  return data.length
}

export const find = async (req: Request, h: ResponseToolkit) => {
  logger.info("Find shifts");
  try {
    const filter = req.query;
    
    if(filter.weekId){
      const [firstDayOfWeek, lastDayOfWeek]: String[] = findWeeklyShift(filter.weekId)

      const newFilter = {
        where: {
          date: Between(firstDayOfWeek, lastDayOfWeek)
        },
        ...filter
      }
      delete filter.weekId

      const [data, totalCount] = await shiftUsecase.find(newFilter);

      const res: ISuccessResponse = {
        statusCode: 200,
        message: "Get shift successful",
        results: {
          data,
          totalCount
        }
      };
      return res;
    }
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

    const checkShift = await isShiftPublished(moment(body.date).toDate())

    if(checkShift) throw new HttpError(400, 'this shift already published')
    
    const [isShiftAvailable] = await shiftUsecase.find({
      where: [{
        date: body.date,
        startTime: LessThan(body.startTime),
        endTime: MoreThan(body.startTime)
      },
      {
        date: body.date,
        startTime: LessThan(body.endTime),
        endTime: MoreThan(body.endTime)
      },
      {
        date: body.date,
        startTime: Equal(body.startTime),
        endTime: Equal(body.endTime)
      }
      ]
    })

    if (isShiftAvailable.length) throw new HttpError(400, `shift on date ${isShiftAvailable[0].date} from ${isShiftAvailable[0].startTime} until ${isShiftAvailable[0].endTime} already exist / overlapping`)

    const data = await shiftUsecase.create(body);
    const res: ISuccessResponse = {
      statusCode: 200,
      message: "Create shift successful",
      results: data
    }
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

    const checkShift = await isShiftPublished(moment.utc(body.date).toDate())

    if(checkShift) throw new HttpError(400, 'this shift already published')

    const [isShiftAvailable] = await shiftUsecase.find({
      where: [{
        id: Not(id),
        date: body.date,
        startTime: LessThan(body.startTime),
        endTime: MoreThan(body.startTime)
      },
      {
        id: Not(id),
        date: body.date,
        startTime: LessThan(body.endTime),
        endTime: MoreThan(body.endTime)
      },
      {
        id: Not(id),
        date: body.date,
        startTime: Equal(body.startTime),
        endTime: Equal(body.endTime)
      }]
    })

    if (isShiftAvailable.length) throw new HttpError(400, `shift on date ${isShiftAvailable[0].date} from ${isShiftAvailable[0].startTime} until ${isShiftAvailable[0].endTime} already exist / overlapping`)


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

export const publish = async (req: Request, h: ResponseToolkit) => {
  logger.info("Publish shift by weekId");
  try {
    const body = req.payload as IPublishShift;
    const checkShift = await isShiftPublished(moment(body.weekId).local().toDate())

    if(checkShift) throw new HttpError(400, 'this shift already published')

    const [data] = await shiftUsecase.publishShiftByWeekId(body);
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
    const shift = await shiftUsecase.findById(id)
    if(shift.isPublished) throw new HttpError(400, 'this shift already published')

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
