import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from '../entities/todo.entity';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { TodoGateway } from '../gateways/todo.gateway';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
    private todoGateway: TodoGateway,
  ) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = this.todoRepository.create(createTodoDto);
    const savedTodo = await this.todoRepository.save(todo);
    this.todoGateway.emitTodoCreated(savedTodo);
    return savedTodo;
  }

  async findAll(filter?: 'all' | 'active' | 'completed'): Promise<Todo[]> {
    const queryBuilder = this.todoRepository.createQueryBuilder('todo');
    
    if (filter === 'active') {
      queryBuilder.where('todo.completed = :completed', { completed: false });
    } else if (filter === 'completed') {
      queryBuilder.where('todo.completed = :completed', { completed: true });
    }
    
    return await queryBuilder
      .orderBy('todo.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Todo> {
    const todo = await this.todoRepository.findOne({ where: { id } });
    if (!todo) {
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }
    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOne(id);
    Object.assign(todo, updateTodoDto);
    const updatedTodo = await this.todoRepository.save(todo);
    this.todoGateway.emitTodoUpdated(updatedTodo);
    return updatedTodo;
  }

  async remove(id: string): Promise<void> {
    const result = await this.todoRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }
    this.todoGateway.emitTodoDeleted(id);
  }

  async clearCompleted(): Promise<void> {
    await this.todoRepository.delete({ completed: true });
    this.todoGateway.emitTodosBulkDeleted('completed');
  }

  async clearAll(): Promise<void> {
    await this.todoRepository.clear();
    this.todoGateway.emitTodosBulkDeleted('all');
  }

  async toggleAll(): Promise<Todo[]> {
    const todos = await this.todoRepository.find();
    const allCompleted = todos.every(todo => todo.completed);
    
    await this.todoRepository.update({}, { completed: !allCompleted });
    const updatedTodos = await this.findAll();
    this.todoGateway.emitTodosBulkUpdated(updatedTodos);
    return updatedTodos;
  }

  async getStats(): Promise<{ total: number; completed: number; active: number }> {
    const total = await this.todoRepository.count();
    const completed = await this.todoRepository.count({ where: { completed: true } });
    const active = total - completed;
    
    return { total, completed, active };
  }
}