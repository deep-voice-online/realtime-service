import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ path: '/' })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger: Logger;

  constructor(private readonly socketService: SocketService) {
    this.logger = new Logger(SocketGateway.name);
  }

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      this.logger.warn(`Client ${client.id} tried to connect without userId`);
      client.disconnect();
      return;
    }

    await client.join(userId);
    this.logger.log(
      `👤 User ${userId} connected and joined room. Socket ID: ${client.id}`,
    );
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`🔌 Client disconnected: ${client.id}`);
  }

  sendToUser(userId: string, event: string, payload: any) {
    this.server.to(userId).emit(event, payload);
    this.logger.log(`📧 Event "${event}" sent to user ${userId}`);
  }
}
