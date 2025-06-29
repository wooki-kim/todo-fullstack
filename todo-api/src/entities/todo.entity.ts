import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  text: string;

  @Column({ default: false })
  completed: boolean;

  @Column({ type: 'enum', enum: ['high', 'medium', 'low'], default: 'medium' })
  priority: 'high' | 'medium' | 'low';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}