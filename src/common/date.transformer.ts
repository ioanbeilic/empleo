import { format } from 'date-fns';

export class DateTransformer {
  static nullable(): DateTransformer {
    return new DateTransformer(true);
  }

  constructor(private readonly isNullable = false) {}

  from(value: string | null): Date | null {
    if (this.isNullable && value == null) {
      return value;
    }

    return new Date(value!);
  }

  to(value: Date | null): string | null {
    if (this.isNullable && value == null) {
      return value;
    }

    return format(value!, 'YYYY-MM-DD');
  }
}
