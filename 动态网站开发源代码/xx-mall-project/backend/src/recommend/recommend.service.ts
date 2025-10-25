import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recommend } from './recommend.entity';

@Injectable()
export class RecommendService {
  constructor(
    @InjectRepository(Recommend)
    private readonly recommendRepository: Repository<Recommend>,
  ) {}

  async getHomeCarousel(): Promise<Recommend[]> {
    return this.recommendRepository.find({
      where: { type: 1 },
      relations: ['goods'],
      order: { id: 'ASC' },
    });
  }
}
