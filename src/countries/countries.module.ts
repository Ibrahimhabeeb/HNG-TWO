import { Module } from '@nestjs/common';
import { CountriesController } from './countries.controller';
import { CountriesService } from './countries.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { ImagesService } from './images.service';
import { StatusController } from './status.controller';

@Module({
  controllers: [CountriesController, StatusController],
  providers: [CountriesService, ImagesService],
  imports: [PrismaModule, HttpModule.register({
     timeout: 10000,
  })]
})
export class CountriesModule {

  


  
}
