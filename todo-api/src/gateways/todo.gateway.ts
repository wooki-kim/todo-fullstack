import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Todo } from '../entities/todo.entity';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class TodoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('TodoGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitTodoCreated(todo: Todo) {
    this.server.emit('todoCreated', todo);
  }

  emitTodoUpdated(todo: Todo) {
    this.server.emit('todoUpdated', todo);
  }

  emitTodoDeleted(todoId: string) {
    this.server.emit('todoDeleted', { id: todoId });
  }

  emitTodosBulkUpdated(todos: Todo[]) {
    this.server.emit('todosBulkUpdated', todos);
  }

  emitTodosBulkDeleted(type: 'completed' | 'all') {
    this.server.emit('todosBulkDeleted', { type });
  }

  emitTodoEditStart(todoId: string, userId: string) {
    this.server.emit('todoEditStart', { todoId, userId });
  }

  emitTodoEditEnd(todoId: string, userId: string) {
    this.server.emit('todoEditEnd', { todoId, userId });
  }

  emitTodoEditChange(todoId: string, text: string, userId: string) {
    this.server.emit('todoEditChange', { todoId, text, userId });
  }

  @SubscribeMessage('startEdit')
  handleStartEdit(
    @MessageBody() data: { todoId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Client ${client.id} started editing todo ${data.todoId}`);
    client.broadcast.emit('todoEditStart', { todoId: data.todoId, userId: client.id });
  }

  @SubscribeMessage('endEdit')
  handleEndEdit(
    @MessageBody() data: { todoId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Client ${client.id} ended editing todo ${data.todoId}`);
    client.broadcast.emit('todoEditEnd', { todoId: data.todoId, userId: client.id });
  }

  @SubscribeMessage('editChange')
  handleEditChange(
    @MessageBody() data: { todoId: string; text: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast.emit('todoEditChange', { 
      todoId: data.todoId, 
      text: data.text, 
      userId: client.id 
    });
  }
}