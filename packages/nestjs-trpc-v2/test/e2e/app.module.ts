import { Module } from '@nestjs/common';
import { TRPCModule } from '../../lib';
import { UserRouter } from './routers/user.router';
import { PostRouter } from './routers/post.router';
import { NotificationRouter } from './routers/notification.router';

@Module({
  imports: [
    TRPCModule.forRoot({
      autoSchemaFile: './test/e2e/generated',
    }),
  ],
  providers: [UserRouter, PostRouter, NotificationRouter],
})
export class AppModule {}
