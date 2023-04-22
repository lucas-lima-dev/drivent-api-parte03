import faker from '@faker-js/faker';
import supertest from 'supertest';
import httpStatus from 'http-status';
import { TicketStatus, TicketType } from '@prisma/client';
import {
  createEnrollmentWithAddress,
  createPayment,
  createTicket,
  createTicketType,
  createTicketTypeWithHotel,
  createTicketTypeWithNoHotel,
  createUser,
} from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { createHotel } from '../factories/hotels-factory';
import app, { init } from '@/app';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 404 when user doesnt have a ticket yet', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    await createEnrollmentWithAddress(user);

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it('should respond with status 404 when user doesnt have an enrollment yet', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it('should respond with status 404 when user doesnt have a hotel yet', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    await createPayment(ticket.id, ticketType.price);

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it('should respond with status 402 if ticket was not paid', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType();

    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it('should respond with status 402 if ticket type doesnt includes hotel ', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithNoHotel();

    await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });
});

describe('when token is valid', () => {
  it('should respond with status 200 and with hotels list', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    await createPayment(ticket.id, ticketType.price);
    await createHotel();

    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.OK);
  });
});

describe('GET /hotels/:hotelId', () => {
  it('should respond with status 404 when there is no hotel', async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithNoHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

    // await createPayment(ticket.id, ticketType.price);

    const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });
});
