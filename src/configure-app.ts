import { INestApplication, ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

export const validationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
};

export function configureApp(app: Pick<INestApplication, 'useGlobalPipes'>): void {
  app.useGlobalPipes(new ValidationPipe(validationPipeOptions));
}
