import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function formatDateYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isDateNotBeforeToday(dateValue: string): boolean {
  if (!dateValue) return false;
  
  // Extraer año, mes y día (compatible con YYYY-MM-DD y formato ISO)
  const match = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return false;

  const inputDateStr = `${match[1]}-${match[2]}-${match[3]}`;

  const now = new Date();
  const todayLocal = formatDateYMD(now);
  const todayUtc = now.toISOString().split('T')[0];

  // Consideramos la fecha más temprana entre local y UTC para permitir la fecha de hoy sin problemas de huso horario
  const earliestToday = todayLocal < todayUtc ? todayLocal : todayUtc;

  return inputDateStr >= earliestToday;
}

export function IsNotPastDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotPastDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          return isDateNotBeforeToday(value);
        },
        defaultMessage(_args: ValidationArguments) {
          return 'La fecha límite no puede ser anterior a la fecha actual.';
        },
      },
    });
  };
}
