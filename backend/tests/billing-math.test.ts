import { describe, expect, it } from 'vitest';

/** Mirrors bill total calculation used in BillService.create */
function calculateBillTotals(input: {
  consultationFee: number;
  medicineCharges: number;
  labCharges: number;
  otherCharges: number;
  discount: number;
  tax: number;
}) {
  const subtotal =
    input.consultationFee + input.medicineCharges + input.labCharges + input.otherCharges;
  const total = Math.max(0, subtotal - input.discount + input.tax);
  return { subtotal, total };
}

describe('billing totals', () => {
  it('sums charges and applies discount/tax', () => {
    expect(
      calculateBillTotals({
        consultationFee: 800,
        medicineCharges: 200,
        labCharges: 100,
        otherCharges: 0,
        discount: 50,
        tax: 105,
      })
    ).toEqual({ subtotal: 1100, total: 1155 });
  });

  it('never returns negative total', () => {
    expect(
      calculateBillTotals({
        consultationFee: 100,
        medicineCharges: 0,
        labCharges: 0,
        otherCharges: 0,
        discount: 500,
        tax: 0,
      }).total
    ).toBe(0);
  });
});
