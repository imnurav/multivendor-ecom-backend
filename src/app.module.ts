import { NotificationsModule } from './modules/notifications/notifications.module';
import { FilesModule } from './modules/files/files.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { OrdersModule } from './modules/orders/orders.module';
import { SearchModule } from './modules/search/search.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { ConfigModule } from './config/config.module';
import { CommonModule } from './common/common.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { UtilsModule } from './utils/utils.module';
import { AppController } from './app.controller';
import { CoreModule } from './core/core.module';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    CoreModule,
    AuthModule,
    CartModule,
    RedisModule,
    QueueModule,
    UtilsModule,
    FilesModule,
    UsersModule,
    AdminModule,
    ConfigModule,
    CommonModule,
    OrdersModule,
    SearchModule,
    VendorsModule,
    CatalogModule,
    ReviewsModule,
    DatabaseModule,
    PaymentsModule,
    ShippingModule,
    InventoryModule,
    AnalyticsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
