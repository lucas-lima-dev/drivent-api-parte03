import { TicketStatus } from '@prisma/client';
import enrollmentRepository from '@/repositories/enrollment-repository';
import { notFoundError, requiredPaymentError, unauthorizedError } from '@/errors';
import hotelsRepository from '@/repositories/hotels-repository';
import ticketsRepository from '@/repositories/tickets-repository';

async function getAll(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  if (enrollment.userId !== userId) throw unauthorizedError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  const ticketType = await ticketsRepository.findTickeWithTypeById(ticket.ticketTypeId);

  if (
    ticketType.TicketType.isRemote ||
    ticket.status === TicketStatus.RESERVED ||
    ticketType.TicketType.includesHotel
  ) {
    throw requiredPaymentError();
  }

  const hotels = await hotelsRepository.getAll();
  if (!hotels) throw notFoundError();

  return hotels;
}

export default { getAll };
