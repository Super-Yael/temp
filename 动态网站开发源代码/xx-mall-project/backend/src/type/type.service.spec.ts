import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeService } from './type.service';
import { Type } from './type.entity';

describe('TypeService', () => {
  let service: TypeService;
  let repository: { find: jest.Mock };

  beforeEach(async () => {
    repository = { find: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeService,
        {
          provide: getRepositoryToken(Type),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<TypeService>(TypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch all types from repository', async () => {
    repository.find.mockResolvedValue([]);
    await service.getAllTypes();
    expect(repository.find).toHaveBeenCalledWith({ order: { id: 'ASC' } });
  });
});
