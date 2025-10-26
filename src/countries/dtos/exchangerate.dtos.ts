/**
 * Data Transfer Objects (DTOs) for the Exchange Rate API response.
 */

/**
 * Interface representing the structure of the dynamic 'rates' object,
 * where keys are currency codes (e.g., "USD", "AFN") and values are numbers.
 * We use a record type for flexible key names.
 */
export interface ExchangeRateMap {
  [currencyCode: string]: number;
}

/**
 * Main DTO for the entire Exchange Rate API response body.
 */
export class ExchangeRateResponseDto {
  /**
   * The result status of the API call (e.g., "success").
   */
  result: string;

  /**
   * The provider of the exchange rate data.
   */
  provider: string;

  /**
   * Link to the documentation.
   */
  documentation: string;

  /**
   * Link to the terms of use.
   */
  terms_of_use: string;

  /**
   * Time of the last update in Unix timestamp format.
   */
  time_last_update_unix: number;

  /**
   * Time of the last update in UTC string format.
   */
  time_last_update_utc: string;

  /**
   * Time of the next expected update in Unix timestamp format.
   */
  time_next_update_unix: number;

  /**
   * Time of the next expected update in UTC string format.
   */
  time_next_update_utc: string;

  /**
   * Time of end-of-life in Unix timestamp format (0 means not set).
   */
  time_eol_unix: number;

  /**
   * The base currency code for the rates (e.g., "USD").
   */
  base_code: string;

  /**
   * An object where keys are currency codes and values are the exchange rates
   * relative to the base_code.
   */
  rates: ExchangeRateMap;
}
