import httpStatus from 'http-status';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import hotelService from '@/services/hotels-service';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const hotels = await hotelService.getAll(userId);
    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    } else if (error.name === 'RequiredPaymentError') {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    } else {
      return res.sendStatus(httpStatus.BAD_REQUEST);
    }
  }
}

export async function getHotelWithRooms(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { userId } = req;
  const { hotelId } = req.params;

  try {
    const hotelWithRooms = await hotelService.getHotelWithRooms(userId, Number(hotelId));
    return res.status(httpStatus.OK).send(hotelWithRooms);
  } catch (error) {
    next(error);
  }
}
