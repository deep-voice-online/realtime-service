import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { RedisIoAdapter } from './common/adapter/redis.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  const redisIoAdapter = new RedisIoAdapter(config, app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  app.connectMicroservice<RmqOptions>({
    transport: Transport.RMQ,
    options: {
      queue: 'transcribe_queue',
      urls: [
        config.getOrThrow<string>(
          'RABBITMQ_URL',
          'amqp://guest:guest@localhost:5672',
        ),
      ],
    },
  });

  const port = config.getOrThrow<number>('HTTP_PORT', 4000);

  await app.startAllMicroservices();
  console.log('started all microservices...');

  await app.listen(port);
  console.log(`🚀 Realtime Gateway listening on port ${port}`);
}

bootstrap();
