import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GoodsService } from './goods.service';
import { Goods } from './goods.entity';

describe('GoodsService', () => {
  let service: GoodsService;
  let repository: { find: jest.Mock };

  beforeEach(async () => {
    repository = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoodsService,
        {
          provide: getRepositoryToken(Goods),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<GoodsService>(GoodsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty list when query missing', async () => {
    await expect(service.searchGoods('')).resolves.toEqual([]);
    expect(repository.find).not.toHaveBeenCalled();
  });

  it('should search goods by name or intro', async () => {
    repository.find.mockResolvedValue([]);
    await service.searchGoods('cake');
    expect(repository.find).toHaveBeenCalled();
  });
});
