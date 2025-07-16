import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { AbstractService } from 'src/common/abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService extends AbstractService {
  constructor(
    @InjectRepository(User) private readonly UserRepository: Repository<User>,
  ) {
    super(UserRepository);
  }

  async create(data: Partial<User>): Promise<User> {
    return this.abstractCreate(data);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.abstractFindOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.abstractFindOne({ where: { email } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.abstractFindOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, data: Partial<User>) {
    await this.abstractUpdate(id, data);
    return this.findById(id);
  }
}
