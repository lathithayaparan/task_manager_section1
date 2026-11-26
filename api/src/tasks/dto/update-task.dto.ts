import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TaskStatus } from '../task-status.enum';

export class UpdateTaskDto {
  @IsOptional()
  @IsString({ message: 'title must be a string' })
  @IsNotEmpty({ message: 'title cannot be empty' })
  @MaxLength(100, { message: 'title must not exceed 100 characters' })
  title?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString({ message: 'description must be a string' })
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, {
    message: 'status must be TODO, IN_PROGRESS, or DONE',
  })
  status?: TaskStatus;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dueDate must be in YYYY-MM-DD format',
  })
  dueDate?: string;
}
