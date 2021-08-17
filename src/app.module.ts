/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { AuthRestModule } from './auth/auth.rest.module';
import { BlocksModule } from './blocks/blocks.module';
import { BlocksRestModule } from './blocks/blocks.rest.module';
import { RequireSslMiddleware } from './common/middlewares/require-ssl.middleware';
import { EventsModule } from './events/events.module';
import { EventsRestModule } from './events/events.rest.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { UsersRestModule } from './users/users.rest.module';

@Module({
  imports: [
    AuthModule,
    AuthRestModule,
    BlocksModule,
    BlocksRestModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        DATABASE_URL: joi.string().required(),
        IRONFISH_API_KEY: joi.string().required(),
        NETWORK_VERSION: joi.number().required(),
      }),
    }),
    EventsModule,
    EventsRestModule,
    HealthModule,
    UsersModule,
    UsersRestModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequireSslMiddleware);
  }
}
