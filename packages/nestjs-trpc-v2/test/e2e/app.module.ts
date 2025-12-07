import { Module } from '@nestjs/common';
import { TRPCModule } from '../../lib';
import { UserRouter } from './routers/user.router';
import { PostRouter } from './routers/post.router';

@Module({
  imports: [
    TRPCModule.forRoot({
      autoSchemaFile: './test/e2e/generated',
    }),
  ],
  providers: [UserRouter, PostRouter],
})
export class AppModule {}
