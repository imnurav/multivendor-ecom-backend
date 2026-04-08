import { Test, TestingModule } from '@nestjs/testing';
import { OrderSplitService } from './order-split.service';

describe('OrderSplitService', () => {
  let service: OrderSplitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderSplitService],
    }).compile();

    service = module.get<OrderSplitService>(OrderSplitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
