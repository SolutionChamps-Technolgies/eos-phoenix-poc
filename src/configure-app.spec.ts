import { ValidationPipe } from '@nestjs/common';
import { configureApp, validationPipeOptions } from './configure-app';

describe('configureApp', () => {
  it('registers a validation pipe for future request bodies', () => {
    const useGlobalPipes = jest.fn();

    configureApp({ useGlobalPipes });

    expect(validationPipeOptions).toEqual({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
    expect(useGlobalPipes).toHaveBeenCalledTimes(1);
    const pipes: unknown[] = useGlobalPipes.mock.calls[0] as unknown[];
    expect(pipes[0]).toBeInstanceOf(ValidationPipe);
  });
});
