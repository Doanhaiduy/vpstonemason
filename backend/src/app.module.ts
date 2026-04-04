import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { EnquiriesModule } from './modules/enquiries/enquiries.module';
import { BlogModule } from './modules/blog/blog.module';
import { ShowroomModule } from './modules/showroom/showroom.module';
import { MailModule } from './modules/mail/mail.module';
import { CatalogModule } from './modules/catalog/catalog.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('database.url');
        if (!uri) {
          throw new Error(
            'Missing MongoDB URI. Set MONGODB_URI or DATABASE_URL.',
          );
        }

        return {
          uri,
          // Fail fast on serverless to avoid 300s function timeouts when DB is unreachable.
          retryAttempts: 1,
          retryDelay: 1000,
          connectTimeoutMS: 10000,
          socketTimeoutMS: 20000,
          serverSelectionTimeoutMS: 10000,
        };
      },
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: (configService.get<number>('throttle.ttl') || 60) * 1000,
          limit: configService.get<number>('throttle.limit') || 100,
        },
      ],
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    ProjectsModule,
    EnquiriesModule,
    BlogModule,
    ShowroomModule,
    MailModule,
    CatalogModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
