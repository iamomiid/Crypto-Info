import { CandleFunctions } from '@core/functions/candle';
import { expect } from 'chai';

describe('Candle Functions', () => {
  it('should transform number to int', () => {
    expect(CandleFunctions.transformStringToInt(19.124567)).to.equal(
      1_912_456_700,
    );
  });

  it('should transform string to int', () => {
    expect(CandleFunctions.transformStringToInt('19.124567')).to.equal(
      1_912_456_700,
    );
  });
});
