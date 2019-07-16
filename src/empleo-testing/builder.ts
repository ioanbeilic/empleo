import faker from 'faker';
import { isUndefined, negate, pickBy } from 'lodash/fp';

const filterUndefined = pickBy(negate(isUndefined));

export abstract class Builder<T extends object> {
  constructor(protected data: Partial<T> = {}) {}

  get faker() {
    return faker;
  }

  with<K extends keyof T>(key: K, value: T[K]): this {
    const ctor = (this.constructor as unknown) as new (data: Partial<T>) => this;

    return new ctor({ ...this.data, [key]: value });
  }

  without<K extends keyof T>(key: K): this {
    const ctor = (this.constructor as unknown) as new (data: Partial<T>) => this;
    const data = { ...this.data };

    delete data[key];

    return new ctor(data);
  }

  hydrate(data: Partial<T>): this {
    const ctor = (this.constructor as unknown) as new (data: Partial<T>) => this;
    data = filterUndefined(data) as Partial<T>;

    return new ctor(data);
  }

  abstract withValidData(): this;

  abstract build(): T;
}
