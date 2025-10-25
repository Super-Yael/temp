import { Test, TestingModule } from '@nestjs/testing';
import { TypeController } from './type.controller';
import { TypeService } from './type.service';

describe('TypeController', () => {
  let controller: TypeController;
  let service: { getAllTypes: jest.Mock };

  beforeEach(async () => {
    service = { getAllTypes: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeController],
      providers: [
        {
          provide: TypeService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<TypeController>(TypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return types from service', async () => {
    const payload = [{ id: 1 }];
    service.getAllTypes.mockResolvedValue(payload);

    await expect(controller.getAllTypes()).resolves.toEqual(payload);
    expect(service.getAllTypes).toHaveBeenCalled();
  });
});
