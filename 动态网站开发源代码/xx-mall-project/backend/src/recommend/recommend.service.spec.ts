import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RecommendService } from './recommend.service';
import { Recommend } from './recommend.entity';

describe('RecommendService', () => {
  let service: RecommendService;
  let repository: { find: jest.Mock };

  beforeEach(async () => {
    repository = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendService,
        {
          provide: getRepositoryToken(Recommend),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<RecommendService>(RecommendService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should delegate carousel lookup to the repository', async () => {
    repository.find.mockResolvedValue([]);
    await service.getHomeCarousel();
    expect(repository.find).toHaveBeenCalledWith({
      where: { type: 1 },
      relations: ['goods'],
      order: { id: 'ASC' },
    });
  });
});
