/**
 * High-precision financial arithmetic using scaled BigInt (Fixed-point: 4 decimal places)
 * Prevents IEEE-754 floating-point inaccuracies.
 */
const SCALE = 10000n; // 4 decimal places
const DECIMALS = 4;
export class Money {
    scaled;
    constructor(value) {
        if (typeof value === 'bigint') {
            this.scaled = value;
        }
        else {
            this.scaled = Money.parseToScaled(String(value));
        }
    }
    static parseToScaled(valStr) {
        const cleaned = valStr.trim();
        if (!cleaned)
            return 0n;
        const isNegative = cleaned.startsWith('-');
        const absStr = isNegative ? cleaned.slice(1) : cleaned;
        const parts = absStr.split('.');
        let whole = parts[0] ? BigInt(parts[0]) : 0n;
        let fractionStr = parts[1] || '';
        // Pad or truncate to DECIMALS digits
        if (fractionStr.length < DECIMALS) {
            fractionStr = fractionStr.padEnd(DECIMALS, '0');
        }
        else if (fractionStr.length > DECIMALS) {
            fractionStr = fractionStr.slice(0, DECIMALS);
        }
        const fraction = BigInt(fractionStr);
        const result = whole * SCALE + fraction;
        return isNegative ? -result : result;
    }
    add(other) {
        const o = other instanceof Money ? other : new Money(other);
        return new Money(this.scaled + o.scaled);
    }
    sub(other) {
        const o = other instanceof Money ? other : new Money(other);
        return new Money(this.scaled - o.scaled);
    }
    mul(multiplier) {
        const m = Money.parseToScaled(String(multiplier));
        const result = (this.scaled * m) / SCALE;
        return new Money(result);
    }
    gte(other) {
        const o = other instanceof Money ? other : new Money(other);
        return this.scaled >= o.scaled;
    }
    gt(other) {
        const o = other instanceof Money ? other : new Money(other);
        return this.scaled > o.scaled;
    }
    lte(other) {
        const o = other instanceof Money ? other : new Money(other);
        return this.scaled <= o.scaled;
    }
    lt(other) {
        const o = other instanceof Money ? other : new Money(other);
        return this.scaled < o.scaled;
    }
    eq(other) {
        const o = other instanceof Money ? other : new Money(other);
        return this.scaled === o.scaled;
    }
    isZero() {
        return this.scaled === 0n;
    }
    isPositive() {
        return this.scaled > 0n;
    }
    toString() {
        const isNegative = this.scaled < 0n;
        const absVal = isNegative ? -this.scaled : this.scaled;
        const whole = absVal / SCALE;
        const fraction = absVal % SCALE;
        const fractionStr = fraction.toString().padStart(DECIMALS, '0');
        return `${isNegative ? '-' : ''}${whole}.${fractionStr}`;
    }
    toDisplay(digits = 2) {
        const num = Number(this.toString());
        return num.toLocaleString('en-IN', {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits,
        });
    }
}
