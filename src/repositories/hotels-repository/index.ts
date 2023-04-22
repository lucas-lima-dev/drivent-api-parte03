import { prisma } from '@/config';

async function getAll() {
  return await prisma.hotel.findMany();
}

async function getHotelWithRooms(hotelId: number) {
  return prisma.hotel.findUnique({
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
