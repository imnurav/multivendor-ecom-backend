import { Test, TestingModule } from '@nestjs/testing';
import { OrderCreatedListener } from './order-created.listener';

describe('OrderCreatedListener', () => {
  let provider: OrderCreatedListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderCreatedListener],
    }).compile();

    provider = module.get<OrderCreatedListener>(OrderCreatedListener);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
