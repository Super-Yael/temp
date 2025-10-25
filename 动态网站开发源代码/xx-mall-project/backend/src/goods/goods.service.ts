import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Goods } from './goods.entity';

@Injectable()
export class GoodsService {
  constructor(
    @InjectRepository(Goods)
    private readonly goodsRepository: Repository<Goods>,
  ) {}

  async findAll(): Promise<Goods[]> {
    return this.goodsRepository.find({
      relations: ['type'],
      order: { id: 'ASC' },
    });
  }

  async searchGoods(query: string): Promise<Goods[]> {
    if (!query || !query.trim()) {
      return [];
    }

    const keyword = `%${query.trim()}%`;
    return this.goodsRepository.find({
      where: [{ name: Like(keyword) }, { intro: Like(keyword) }],
      relations: ['type'],
      order: { id: 'ASC' },
    });
  }
}
