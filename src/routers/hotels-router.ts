import { Router } from 'express';
import { authenticateToken, validateParams } from '@/middlewares';
import { getHotelWithRooms, getHotels } from '@/controllers/hotels-controller';
import { hotelIdSchema } from '@/schemas/hotels-schemas';

const hotelsRouter = Router();

hotelsRouter
  .all('/*', authenticateToken)
  .get('/', getHotels)
  .get('/:hotelId', validateParams(hotelIdSchema), getHotelWithRooms);

export { hotelsRouter };
