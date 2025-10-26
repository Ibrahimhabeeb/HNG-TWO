import { Controller, Injectable } from '@nestjs/common';
import { Post, Get, Delete, Query, Param, Res } from '@nestjs/common';
import * as fs from 'fs';
import type { Response } from 'express';
import { NotFoundException } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { ImagesService } from './images.service';
import { QueryDto } from './dtos/countries.dtos';
@Injectable()
@Controller('countries')
export class CountriesController {

constructor(
    private readonly countriesService: CountriesService,
    private readonly imageService: ImagesService,
  ) {}

  @Post('/refresh')
  async refresh() {
    return this.countriesService.refreshCountries();
  }

  @Get('/')
  async findAll(@Query() query: QueryDto) {
    return this.countriesService.findAll(query);
  }

  @Get('/image')
  async getImage(@Res() res: Response) {
    const imagePath = this.imageService.getImagePath();

    if (!fs.existsSync(imagePath)) {
      throw new NotFoundException({ error: 'Summary image not found' });
    }

    res.sendFile(imagePath, { root: '.' });
  }

  @Get('/:name')
  async findOne(@Param('name') name: string) {
    return this.countriesService.getSingle(name);
  }

  @Delete('/:name')
  async remove(@Param('name') name: string) {
    return this.countriesService.remove(name);
  }

  @Get('status')
  async getStatus() {
    return this.countriesService.getStatus();
  }




    
}
