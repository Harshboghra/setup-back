import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

export function handleDbError(error: any): never {
  // Postgres unique violation
  if (error instanceof QueryFailedError && (error as any).code === '23505') {
    const detail = (error as any).detail;

    // Try to extract: (field)=(value)
    const match = detail.match(/\(([^)]+)\)=\(([^)]+)\)/);
    if (match) {
      const field = match[1];
      const value = match[2];
      throw new ConflictException(`${field} "${value}" already exists`);
    }

    throw new ConflictException('Duplicate value already exists');
  }

  // Extend for more error types if needed

  throw new InternalServerErrorException('Unexpected database error');
}
