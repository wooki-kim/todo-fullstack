import { IsOptional, IsEnum } from 'class-validator';

export class TodoFilterDto {
  @IsOptional()
  @IsEnum(['all', 'active', 'completed'])
  filter?: 'all' | 'active' | 'completed' = 'all';
}