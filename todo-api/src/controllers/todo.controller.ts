import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TodoService } from '../services/todo.service';
import { CreateTodoDto } from '../dto/create-todo.dto';
import { UpdateTodoDto } from '../dto/update-todo.dto';
import { TodoFilterDto } from '../dto/todo-filter.dto';

@Controller('todos')
@UsePipes(new ValidationPipe({ transform: true }))
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto) {
    return this.todoService.create(createTodoDto);
  }

  @Get()
  findAll(@Query() filterDto: TodoFilterDto) {
    return this.todoService.findAll(filterDto.filter);
  }

  @Get('stats')
  getStats() {
    return this.todoService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todoService.update(id, updateTodoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todoService.remove(id);
  }

  @Delete()
  clearCompleted(@Query('type') type?: string) {
    if (type === 'all') {
      return this.todoService.clearAll();
    }
    return this.todoService.clearCompleted();
  }

  @Patch()
  toggleAll() {
    return this.todoService.toggleAll();
  }
}