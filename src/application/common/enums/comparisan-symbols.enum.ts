import { Equal, Not, LessThan, MoreThanOrEqual, MoreThan, LessThanOrEqual } from 'typeorm';

export enum ComparisonSymbols {
  EQUAL = '=',
  NOT_EQUAL = '!=',
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<=',
}

export const ComparisonSymbolsOperators = {
  [ComparisonSymbols.EQUAL]: Equal,
  [ComparisonSymbols.NOT_EQUAL]: Not,
  [ComparisonSymbols.GREATER_THAN]: MoreThan,
  [ComparisonSymbols.GREATER_THAN_OR_EQUAL]: MoreThanOrEqual,
  [ComparisonSymbols.LESS_THAN]: LessThan,
  [ComparisonSymbols.LESS_THAN_OR_EQUAL]: LessThanOrEqual,
};
