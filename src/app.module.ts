import { Module } from '@nestjs/common';
import { CountriesModule } from './countries/countries.module';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [CountriesModule,
     HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
    PrismaModule,
     ConfigModule.forRoot({
      isGlobal: true, // Makes config available everywhere
    
    }),
 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
