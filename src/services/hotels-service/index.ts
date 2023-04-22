import { TicketStatus } from '@prisma/client';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { notFoundError, requiredPaymentError, unauthorizedError } from '@/errors';
import hotelsRepository from '@/repositories/hotels-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function checkUserEnrollmentAndTicket(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  if (enrollment.userId !== userId) throw unauthorizedError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  if (ticket.TicketType.isRemote || ticket.status !== TicketStatus.PAID || !ticket.TicketType.includesHotel) {
    throw requiredPaymentError();
  }
}

async function getAll(userId: number) {
  await checkUserEnrollmentAndTicket(userId);

  const hotels = await hotelsRepository.getAll();
  if (hotels.length === 0) throw notFoundError();

  return hotels;
}

export default { getAll };
