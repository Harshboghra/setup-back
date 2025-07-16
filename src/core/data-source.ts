import { DataSource } from 'typeorm';
import { typeOrmConfig } from '../config/typeOrm';

export const dataSource = new DataSource(typeOrmConfig());
