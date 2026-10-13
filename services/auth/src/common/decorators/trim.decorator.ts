import { Transform, TransformOptions } from 'class-transformer';

export function Trim(options?: TransformOptions): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  }, options);
}
