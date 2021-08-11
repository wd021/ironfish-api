/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import {
  INestApplication,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import faker from 'faker';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { bootstrapTestApp } from '../test/test-app';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await bootstrapTestApp();
    usersService = app.get(UsersService);
    prisma = app.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('findOrThrow', () => {
    describe('with a valid id', () => {
      it('returns the record', async () => {
        const user = await prisma.user.create({
          data: {
            email: faker.internet.email(),
            graffiti: uuid(),
            country_code: faker.address.countryCode('alpha-3'),
          },
        });
        const record = await usersService.findOrThrow(user.id);
        expect(record).not.toBeNull();
        expect(record).toMatchObject(user);
      });
    });

    describe('with a missing id', () => {
      it('returns null', async () => {
        await expect(usersService.findOrThrow(1337)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe('findByGraffiti', () => {
    describe('with a valid graffiti', () => {
      it('returns the record', async () => {
        const user = await prisma.user.create({
          data: {
            email: faker.internet.email(),
            graffiti: uuid(),
            country_code: faker.address.countryCode('alpha-3'),
            last_login_at: new Date(),
          },
        });
        const record = await usersService.findByGraffiti(user.graffiti);
        expect(record).not.toBeNull();
        expect(record).toMatchObject(user);
      });
    });

    describe('with a user not logged in yet', () => {
      it('returns null', async () => {
        const user = await prisma.user.create({
          data: {
            email: faker.internet.email(),
            graffiti: uuid(),
            country_code: faker.address.countryCode('alpha-3'),
          },
        });
        const record = await usersService.findByGraffiti(user.graffiti);
        expect(record).toBeNull();
      });
    });

    describe('with a missing id', () => {
      it('returns null', async () => {
        expect(await usersService.findByGraffiti('1337')).toBeNull();
      });
    });
  });

  describe('findOrThrowByGraffiti', () => {
    describe('with a valid graffiti', () => {
      it('returns the record', async () => {
        const user = await prisma.user.create({
          data: {
            email: faker.internet.email(),
            graffiti: uuid(),
            country_code: faker.address.countryCode('alpha-3'),
            last_login_at: new Date(),
          },
        });
        const record = await usersService.findOrThrowByGraffiti(user.graffiti);
        expect(record).not.toBeNull();
        expect(record).toMatchObject(user);
      });
    });

    describe('with a missing id', () => {
      it('throws an exception', async () => {
        await expect(
          usersService.findOrThrowByGraffiti('1337'),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('list', () => {
    it('returns a chunk of users', async () => {
      const limit = 2;
      const records = await usersService.list({
        limit,
      });
      expect(records).toHaveLength(limit);
      for (const record of records) {
        expect(record).toMatchObject({
          id: expect.any(Number),
          email: expect.any(String),
          graffiti: expect.any(String),
        });
      }
    });

    describe('if an order by points is provided', () => {
      it('sorts the users by points', async () => {
        const records = await usersService.list({
          orderBy: 'total_points',
        });

        for (let i = 1; i < records.length; i++) {
          const previousRecord = records[i - 1];
          const record = records[i];
          expect(previousRecord.total_points).toBeGreaterThanOrEqual(
            record.total_points,
          );
        }
      });
    });
  });

  describe('create', () => {
    describe('with a duplicate graffiti', () => {
      describe('with a previously activated user', () => {
        it('throws an exception', async () => {
          const graffiti = uuid();
          await prisma.user.create({
            data: {
              email: faker.internet.email(),
              graffiti,
              country_code: faker.address.countryCode('alpha-3'),
              last_login_at: new Date(),
            },
          });

          await expect(
            usersService.create(
              faker.internet.email(),
              graffiti,
              faker.address.countryCode('alpha-3'),
            ),
          ).rejects.toThrow(UnprocessableEntityException);
        });
      });

      describe('with a user that has not been activated', () => {
        it('creates a record', async () => {
          const graffiti = uuid();
          await prisma.user.create({
            data: {
              email: faker.internet.email(),
              graffiti,
              country_code: faker.address.countryCode('alpha-3'),
            },
          });

          const email = faker.internet.email();
          const user = await usersService.create(
            email,
            graffiti,
            faker.address.countryCode('alpha-3'),
          );

          expect(user).toMatchObject({
            id: expect.any(Number),
            email,
            graffiti,
          });
        });
      });
    });

    describe('with a duplicate email', () => {
      describe('with a previously activated user', () => {
        it('throws an exception', async () => {
          const email = faker.internet.email();
          await prisma.user.create({
            data: {
              email,
              graffiti: uuid(),
              country_code: faker.address.countryCode('alpha-3'),
              last_login_at: new Date(),
            },
          });

          await expect(
            usersService.create(
              email,
              uuid(),
              faker.address.countryCode('alpha-3'),
            ),
          ).rejects.toThrow(UnprocessableEntityException);
        });
      });

      describe('with a user that has not been activated', () => {
        it('creates a record', async () => {
          const email = faker.internet.email();
          await prisma.user.create({
            data: {
              email,
              graffiti: uuid(),
              country_code: faker.address.countryCode('alpha-3'),
            },
          });

          const graffiti = uuid();
          const user = await usersService.create(
            email,
            graffiti,
            faker.address.countryCode('alpha-3'),
          );

          expect(user).toMatchObject({
            id: expect.any(Number),
            email,
            graffiti,
          });
        });
      });
    });

    describe('with a new graffiti and email', () => {
      it('creates a new record', async () => {
        const email = faker.internet.email();
        const graffiti = uuid();
        const user = await usersService.create(
          email,
          graffiti,
          faker.address.countryCode('alpha-3'),
        );

        expect(user).toMatchObject({
          id: expect.any(Number),
          email,
          graffiti,
        });
      });
    });
  });
});
