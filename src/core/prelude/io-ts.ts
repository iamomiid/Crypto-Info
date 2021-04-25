import { alt } from '@infra/types/alt';
import * as t from 'io-ts';
import { NumberFromString } from 'io-ts-types';
export * from 'io-ts';
export {
  UUID,
  fromNullable,
  optionFromNullable,
  date,
  NumberFromString,
  DateFromNumber,
} from 'io-ts-types';
export const numberOrString = alt(t.number, NumberFromString);
