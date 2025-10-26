import { IsIn, IsOptional, IsString } from 'class-validator';

export class FilterCountryDto {
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  @IsIn(['gdp_desc'])
  sort?: string;
}

export class CurrencyDto {
  /**
   * The ISO 4217 code for the currency (e.g., "AFN").
   */
  code: string;

  /**
   * The name of the currency (e.g., "Afghan afghani").
   */
  name: string;

  /**
   * The symbol of the currency (e.g., "؋").
   */
  symbol: string;
}

// Main DTO for the Country object
export class CountriesApiResponse {
  /**
   * The common name of the country (e.g., "Afghanistan").
   */
  name: string;

  /**
   * The capital city (e.g., "Kabul").
   */
  capital: string;

  /**
   * The region the country belongs to (e.g., "Asia").
   */
  region: string;

  /**
   * The total population of the country.
   */
  population: number;

  /**
   * An array of currencies used in the country.
   */
  currencies: CurrencyDto[];

  /**
   * A URL linking to the country's flag image.
   */
  flag: string;

  /**
   * A boolean indicating if the country is politically independent.
   */
  independent: boolean;
}


export class QueryDto {
  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  sort?: 'gdp_asc' | 'gdp_desc';
}


export interface CountryForImage {
  name: string;
  region: string;
  population: bigint;
  currencyCode: string;
  estimatedGdp: any;
}

export class StatusDto {
  total_countries: number;
  last_refreshed_at: Date | null;
}