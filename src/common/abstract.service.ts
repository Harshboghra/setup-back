import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export abstract class AbstractService {
  protected constructor(protected readonly repository: Repository<any>) {}

  async abstractFind(options): Promise<any[]> {
    return this.repository.find(options);
  }

  async abstractFindOne(options): Promise<any> {
    const result = await this.repository.find(options);
    return result?.[0] || null;
  }

  async abstractCreate(data): Promise<any> {
    const entity = await this.repository.create(data);
    return await this.repository.save(entity);
  }

  async abstractUpdate(id: number | string, data): Promise<any> {
    await this.repository.update(id, data);
    return await this.repository.findOne({ where: { id } as any });
  }

  async abstractRemove(id: number | string): Promise<void> {
    await this.repository.delete(id);
  }
}
