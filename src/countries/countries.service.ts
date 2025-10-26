import { Injectable , Logger} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { ImagesService } from "./images.service";
import { ConfigService } from "@nestjs/config";
import { CountriesApiResponse, QueryDto, CountryForImage, StatusDto } from "./dtos/countries.dtos";
import { InternalServerErrorException, ServiceUnavailableException } from "@nestjs/common";
import { ExchangeRateResponseDto} from "./dtos/exchangerate.dtos";
import { PrismaClient, Prisma, Country } from "@prisma/client";
import { NotFoundException } from "@nestjs/common";


@Injectable()
export class CountriesService {

    private readonly logger = new Logger(CountriesService.name);
    constructor(private readonly prisma: PrismaService,
        private readonly httpService: HttpService,
       
        private configService: ConfigService,
        private imageService: ImagesService,
    ) {
      
    }
 
    
    async fetchCountries(): Promise<CountriesApiResponse[]> {
        try {
            const url = this.configService.get<string>('COUNTRIES_API_URL');
            this.logger.log(`Fetching countries from: ${url}`);
            if (!url) {
                this.logger.error(
                    'CRITICAL: COUNTRIES_API_URL is missing. Cannot fetch data.',
                );
                throw new InternalServerErrorException("failed to load  countries api url from env")
            }


            const response = await firstValueFrom(
                this.httpService.get<CountriesApiResponse[]>(url),
            );

            this.logger.log(`Successfully fetched ${response.data.length} countries`);
            return response.data;
        } catch (error) {
            this.logger.error('Failed to fetch countries', error);
            throw new ServiceUnavailableException({
                error: 'External data source unavailable',
                details: 'Could not fetch data from Countries API',
            });
        }
    }

    
    
    

    async fetchExchangeRates(): Promise<ExchangeRateResponseDto> {
        try {
            const url = this.configService.get<string>('EXCHANGE_API_URL');
            this.logger.log(`Fetching exchange rates from: ${url}`);
            if (!url) {
                this.logger.error(
                    'CRITICAL: EXCHANGE RATE URL is missing can not fetch data',
                );
                throw new InternalServerErrorException("failed to load exchange rate  api url from env")
            }

            const response = await firstValueFrom(
                this.httpService.get<ExchangeRateResponseDto>(url),
            );

            this.logger.log(
                `Successfully fetched exchange rates for ${Object.keys(response.data.rates).length} currencies`,
            );
            return response.data;
        } catch (error) {
            this.logger.error('Failed to fetch exchange rates', error);
            throw new ServiceUnavailableException({
                error: 'External data source unavailable',
                details: 'Could not fetch data from Exchange Rate API',
            });
        }
    }

    
    
    async refreshCountries(): Promise<{ message: string; count: number }> {
        this.logger.log('Starting country refresh process...');

        // Fetch data from external APIs
        const countries = await this.fetchCountries();
        const exchangeRates = await this.fetchExchangeRates();

        const now = new Date();
        let processedCount = 0;

        // Process each country
        for (const countryData of countries) {
            try {
                const currencyCode =
                    countryData.currencies && countryData.currencies.length > 0
                        ? countryData.currencies[0].code
                        : null;

                let exchangeRate: number | null = null;
                let estimated_gdp: number | null = null;

                if (currencyCode && exchangeRates.rates[currencyCode]) {
                    exchangeRate = exchangeRates.rates[currencyCode];
          
        
            
                    const randomMultiplier = Math.random() * 1000 + 1000; // 1000-2000
                    estimated_gdp = (countryData.population * randomMultiplier) / exchangeRate;
                } else if (currencyCode) {
                    // Currency code exists but not in exchange rates
                    exchangeRate = null;
                    estimated_gdp = null;
                } else {
                    // No currency at all
                    estimated_gdp = 0;
                }

                const countryRecord: Prisma.CountryCreateInput = {
                    name: countryData.name,
                    capital: countryData.capital || null,
                    region: countryData.region || null,
                    population: BigInt(countryData.population),
                    currency_code: currencyCode,
                    exchange_rate: exchangeRate !== null ? new Prisma.Decimal(exchangeRate) : null,
                    estimated_gdp: estimated_gdp !== null ? new Prisma.Decimal(estimated_gdp) : null,
                    flag_url: countryData.flag || null,
                    last_refreshed_at: now,
                };

              
                await this.prisma.country.upsert({
                    where: { name: countryData.name },
                    update: countryRecord,
                    create: countryRecord,
                });

                processedCount++;


            } catch (error) {
                this.logger.error(`Failed to process country: ${countryData.name}`, error);
            }
        }

        this.logger.log(`Successfully processed ${processedCount} countries`);
         try {
      const totalCountries = await this.prisma.country.count();
      const top5Raw = await this.prisma.country.findMany({
  where: {
    estimated_gdp: { not: null },
  },
  orderBy: {
    estimated_gdp: 'desc',
  },
  take: 5,
  select: {
    name: true,
    region: true,
    population: true,
    currency_code: true,
    estimated_gdp: true,
  },
});

// Now map them to match your interface (camelCase)
const top5: CountryForImage[] = top5Raw.map((c) => ({
  name: c.name,
  region: c.region ?? '', // handle null if necessary
  population: c.population,
  currencyCode: c.currency_code ?? '',
  estimatedGdp: c.estimated_gdp,
}));
             
    await this.imageService.generateSummaryImage(totalCountries, top5, now);
    } catch (error) {
      this.logger.error('Failed to generate summary image', error);
    }

    return {
      message: 'Countries refreshed successfully',
      count: processedCount,
    };

    
    }


    async findAll(query: QueryDto) {
    const where: Prisma.CountryWhereInput = {};

    if (query.region) {
        where.region = { contains: query.region}
       
    }

    if (query.currency) {
      where.currency_code = {contains: query.currency };
    }

    let orderBy: Prisma.CountryOrderByWithRelationInput = { id: 'asc' };

    if (query.sort === 'gdp_desc') {
      orderBy = { estimated_gdp: 'desc' };
    } else if (query.sort === 'gdp_asc') {
      orderBy = { estimated_gdp: 'asc' };
    }

    const countries = await this.prisma.country.findMany({
      where,
      orderBy,
    });

        return countries.map((c) => ({
  ...c,
  population: Number(c.population),
}));

 
    }
    

    async getSingle(name : string) {
         const country = await this.prisma.country.findFirst({
      where: {
        name: { equals: name},
      },
    });

    if (!country) {
      throw new NotFoundException({ error: 'Country not found' });
        }
        return {
            ...country,
             population: Number(country.population),
       }
    }
    

    async remove(name: string): Promise<{ message: string }> {
    const country = await this.prisma.country.findFirst({
      where: {
        name: { equals: name},
      },
    });

    if (!country) {
      throw new NotFoundException({ error: 'Country not found' });
    }

    await this.prisma.country.delete({
      where: { id: country.id },
    });

    return { message: `Country ${name} deleted successfully` };
    }
    
     async getStatus(): Promise<StatusDto> {
    const totalCountries = await this.prisma.country.count();
    const lastRefreshed = await this.prisma.country.findFirst({
      orderBy: { last_refreshed_at: 'desc' },
      select: { last_refreshed_at: true },
    });

    return {
      total_countries: totalCountries,
      last_refreshed_at: lastRefreshed?.last_refreshed_at || null,
    };
  }

    
}