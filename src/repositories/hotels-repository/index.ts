import { prisma } from '@/config';

async function getAll() {
  return await prisma.hotel.findMany();
}

const hotelsRepository = {
  getAll,
};

export default hotelsRepository;
