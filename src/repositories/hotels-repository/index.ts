import { prisma } from '@/config';

async function getAll() {
  return await prisma.hotel.findMany();
}

async function getHotelWithRooms(hotelId: number) {
  return await prisma.hotel.findFirst({
    where: { id: hotelId },
    include: {
      Rooms: true,
    },
  });
}

const hotelsRepository = {
  getAll,
  getHotelWithRooms,
};

export default hotelsRepository;
