import { Test, TestingModule } from '@nestjs/testing';
import { GoodsController } from './goods.controller';
import { GoodsService } from './goods.service';

describe('GoodsController', () => {
  let controller: GoodsController;
  let service: { searchGoods: jest.Mock };

  beforeEach(async () => {
    service = { searchGoods: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoodsController],
      providers: [
        {
          provide: GoodsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<GoodsController>(GoodsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should forward search queries to the service', async () => {
    const results = [{ id: 1 }];
    service.searchGoods.mockResolvedValue(results);

    await expect(controller.searchGoods('ice')).resolves.toEqual(results);
    expect(service.searchGoods).toHaveBeenCalledWith('ice');
  });
});
