import {
  arraysEqual,
  moneyCeil,
  moneyFloor,
  moneyRound,
  pipe,
  plural,
  seq
} from '.';

const add = (a: any, b: any) => a + b;
const inc = (num: any) => num + 1;
const dbl = (num: any) => num * 2;

test('plural should work correctly', () => {
  expect(plural(1, 'item')).toBe('item');
  expect(plural(2, 'item')).toBe('items');
  expect(plural(9392739273, 'item')).toBe('items');
  expect(plural(0, 'item')).toBe('items');
});

describe('pipe', () => {
  it('passes the results of inc to dbl', () => {
    const pipeline = pipe(inc, dbl);
    const result = pipeline(2);
    expect(result).toBe(6);
  });

  it('passes the results of dbl to inc', () => {
    const pipeline = pipe(dbl, inc);
    const result = pipeline(2);
    expect(result).toBe(5);
  });

  it('works with more than 2 functions', () => {
    const pipeline = pipe(add, inc, dbl, inc);
    const result = pipeline(1, 2);
    expect(result).toBe(9);
  });
});

describe('seq', () => {
  let f: jest.Mock;
  let g: jest.Mock;
  let pipeline: any;

  beforeEach(() => {
    f = jest.fn();
    g = jest.fn();
    pipeline = seq(f, g);
  });

  it('should call fns in seq', () => {
    pipeline();

    expect(f).toHaveBeenCalled();
    expect(g).toHaveBeenCalled();
  });

  it('can call more than 2 functions', () => {
    const ff = jest.fn();
    const inSeq = seq(f, g, ff);

    inSeq(10);

    expect(f).toHaveBeenCalled();
    expect(g).toHaveBeenCalled();
  });

  it('should call fns with passed arg', () => {
    const arg = 10;

    pipeline(arg);

    expect(f).toHaveBeenCalledWith(arg);
    expect(g).toHaveBeenCalledWith(arg);
  });

  it('should call each fn only once', () => {
    const ff = jest.fn();
    seq(f, g, ff)(22);

    expect(f.mock.calls.length).toBe(1);
    expect(g.mock.calls.length).toBe(1);
    expect(ff.mock.calls.length).toBe(1);
  });
});

describe('arraysEqual', () => {
  it('should handle empty arrays', () => {
    expect(arraysEqual([], [])).toBeTruthy();
    expect(arraysEqual([], [1])).toBeFalsy();
    expect(arraysEqual([1], [])).toBeFalsy();
  });

  it('should handle non-empty arrays', () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBeTruthy();
    expect(arraysEqual([1, 2, 3], [1, 2])).toBeFalsy();
  });

  it('should consider order of elements', () => {
    expect(arraysEqual([1, 2, 3], [1, 3, 2])).toBeFalsy();
  });

  it('should do strict comparing', () => {
    expect(arraysEqual([0], [false])).toBeFalsy();
  });

  it('should do shallow comparing', () => {
    expect(arraysEqual([{}], [{}])).toBeFalsy();
    const a = {};
    expect(arraysEqual([a], [a])).toBeTruthy();
  });
});

describe('moneyCeil', () => {
  it('should handle undefined value', () => {
    const foo: any = undefined;
    expect(moneyCeil(foo, 2)).toBe(0);
  });

  it('should ceil to accuracy', () => {
    expect(moneyCeil(1.8888888, 2)).toBe(1.89);
  });

  it('should ceil resulting value', () => {
    expect(moneyCeil(1.8801, 2)).toBe(1.89);
  });

  it('should avoid Floating-Point issue', () => {
    expect(moneyCeil(0.1 + 0.2)).toBe(0.3);
  });
});

describe('moneyFloor', () => {
  it('should handle undefined value', () => {
    const foo: any = undefined;
    expect(moneyFloor(foo, 2)).toBe(0);
  });

  it('should floor to accuracy', () => {
    expect(moneyFloor(1.8888888, 2)).toBe(1.88);
  });

  it('should avoid Floating-Point issue', () => {
    expect(moneyFloor(0.999999999)).toBe(1);
  });
});

describe('moneyRound', () => {
  it('should handle undefined value', () => {
    const foo: any = undefined;
    expect(moneyRound(foo, 2)).toBe(0);
  });

  it('should round to accuracy', () => {
    expect(moneyRound(1.8888888, 2)).toBe(1.89);
  });

  it('should avoid Floating-Point issue', () => {
    expect(moneyRound(0.1 + 0.2)).toBe(0.3);
  });
});
