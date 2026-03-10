import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

export class RedisIoAdapter extends IoAdapter {
  constructor(
    private readonly configService: ConfigService,
    appOrHttpServer?: any, // Добавь это
  ) {
    super(appOrHttpServer); // Передай это сюда
  }

  private adapterConstructor: ReturnType<typeof createAdapter>;

  // Сделаем его async, чтобы в main.ts точно знать, что мы готовы
  async connectToRedis(): Promise<void> {
    const pubClient = new Redis({
      username: this.configService.get<string>('REDIS_USER'),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      host: this.configService.getOrThrow<string>('REDIS_HOST'),
      port: this.configService.getOrThrow<number>('REDIS_PORT'),
      lazyConnect: true,
    });

    const subClient = pubClient.duplicate();

    // Ждем, пока клиенты будут готовы
    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}