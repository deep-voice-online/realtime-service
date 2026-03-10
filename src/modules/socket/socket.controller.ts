import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmitToUserRequest } from '@deepvoicerut/contracts/gen/realtime';
import { SocketGateway } from './socket.gateway';

@Controller()
export class SocketController {
  constructor(private readonly socketGateway: SocketGateway) {}

  @EventPattern('transcription.completed')
  handleTranscriptionCompleted(@Payload() dto: EmitToUserRequest) {
    const { userId, payloadJson } = dto;
    console.log(`\n[RabbitMQ] Пришло событие для юзера: ${userId}`);

    this.socketGateway.sendToUser(userId, 'transcription_ready', {
      text: payloadJson,
      receivedAt: new Date().toISOString(),
    });
    console.log(`[Socket] Текст отправлен в сокет комнаты ${userId}\n`);
  }
}
