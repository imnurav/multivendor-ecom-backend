import { OrderCreatedListener } from './listeners/order-created.listener/order-created.listener';
import { OrderSnapshotService } from './services/order-snapshot/order-snapshot.service';
import { OrdersRepository } from './repositories/orders.repository/orders.repository';
import { OrderCreatedEvent } from './events/order-created.event/order-created.event';
import { OrderStatusService } from './services/order-status/order-status.service';
import { OrderSplitService } from './services/order-split/order-split.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    OrderSnapshotService,
    OrderSplitService,
    OrderStatusService,
    OrdersRepository,
    OrderCreatedEvent,
    OrderCreatedListener,
  ],
})
export class OrdersModule {}
