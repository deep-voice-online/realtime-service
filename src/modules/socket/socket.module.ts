import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { SocketController } from './socket.controller';

@Module({
  controllers: [SocketController],
  providers: [SocketGateway, SocketService],
})
export class SocketModule {}
