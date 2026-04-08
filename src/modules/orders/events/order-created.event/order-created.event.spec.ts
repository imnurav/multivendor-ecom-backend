import { Test, TestingModule } from '@nestjs/testing';
import { OrderCreatedEvent } from './order-created.event';

describe('OrderCreatedEvent', () => {
  let provider: OrderCreatedEvent;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderCreatedEvent],
    }).compile();

    provider = module.get<OrderCreatedEvent>(OrderCreatedEvent);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
