import { Test, TestingModule } from '@nestjs/testing';
import { RecommendController } from './recommend.controller';
import { RecommendService } from './recommend.service';

describe('RecommendController', () => {
  let controller: RecommendController;
  let service: { getHomeCarousel: jest.Mock };

  beforeEach(async () => {
    service = { getHomeCarousel: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendController],
      providers: [
        {
          provide: RecommendService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<RecommendController>(RecommendController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return home carousel data from the service', async () => {
    const data = [{ id: 1 }];
    service.getHomeCarousel.mockResolvedValue(data);

    await expect(controller.getHomeCarousel()).resolves.toEqual(data);
    expect(service.getHomeCarousel).toHaveBeenCalled();
  });
});
