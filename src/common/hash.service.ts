import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HashService {
  private readonly rounds: number;
  constructor(cfg: ConfigService) {
    this.rounds = +cfg.get<number>('BCRYPT_SALT_ROUNDS', 12);
  }
  hash(data: string) {
    return bcrypt.hash(data, this.rounds);
  }
  compare(raw: string, hashed: string) {
    return bcrypt.compare(raw, hashed);
  }
}
