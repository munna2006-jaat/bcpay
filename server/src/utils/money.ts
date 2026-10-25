/**
 * High-precision financial arithmetic using scaled BigInt (Fixed-point: 4 decimal places)
 * Prevents IEEE-754 floating-point inaccuracies.
 */

const SCALE = 10000n; // 4 decimal places
const DECIMALS = 4;

export class Money {
  private scaled: bigint;

  constructor(value: string | number | bigint) {
    if (typeof value === 'bigint') {
      this.scaled = value;
    } else {
      this.scaled = Money.parseToScaled(String(value));
    }
  }

  private static parseToScaled(valStr: string): bigint {
    const cleaned = valStr.trim();
    if (!cleaned) return 0n;

    const isNegative = cleaned.startsWith('-');
    const absStr = isNegative ? cleaned.slice(1) : cleaned;
    const parts = absStr.split('.');
    
    let whole = parts[0] ? BigInt(parts[0]) : 0n;
    let fractionStr = parts[1] || '';
    
    // Pad or truncate to DECIMALS digits
    if (fractionStr.length < DECIMALS) {
      fractionStr = fractionStr.padEnd(DECIMALS, '0');
    } else if (fractionStr.length > DECIMALS) {
      fractionStr = fractionStr.slice(0, DECIMALS);
    }

    const fraction = BigInt(fractionStr);
    const result = whole * SCALE + fraction;
    return isNegative ? -result : result;
  }

  public add(other: Money | string | number): Money {
    const o = other instanceof Money ? other : new Money(other);
    return new Money(this.scaled + o.scaled);
  }

  public sub(other: Money | string | number): Money {
    const o = other instanceof Money ? other : new Money(other);
    return new Money(this.scaled - o.scaled);
  }

  public mul(multiplier: string | number): Money {
    const m = Money.parseToScaled(String(multiplier));
    const result = (this.scaled * m) / SCALE;
    return new Money(result);
  }

  public gte(other: Money | string | number): boolean {
    const o = other instanceof Money ? other : new Money(other);
    return this.scaled >= o.scaled;
  }

  public gt(other: Money | string | number): boolean {
    const o = other instanceof Money ? other : new Money(other);
    return this.scaled > o.scaled;
  }

  public lte(other: Money | string | number): boolean {
    const o = other instanceof Money ? other : new Money(other);
    return this.scaled <= o.scaled;
  }

  public lt(other: Money | string | number): boolean {
    const o = other instanceof Money ? other : new Money(other);
    return this.scaled < o.scaled;
  }

  public eq(other: Money | string | number): boolean {
    const o = other instanceof Money ? other : new Money(other);
    return this.scaled === o.scaled;
  }

  public isZero(): boolean {
    return this.scaled === 0n;
  }

  public isPositive(): boolean {
    return this.scaled > 0n;
  }

  public toString(): string {
    const isNegative = this.scaled < 0n;
    const absVal = isNegative ? -this.scaled : this.scaled;
    const whole = absVal / SCALE;
    const fraction = absVal % SCALE;
    const fractionStr = fraction.toString().padStart(DECIMALS, '0');
    return `${isNegative ? '-' : ''}${whole}.${fractionStr}`;
  }

  public toDisplay(digits = 2): string {
    const num = Number(this.toString());
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }
}
