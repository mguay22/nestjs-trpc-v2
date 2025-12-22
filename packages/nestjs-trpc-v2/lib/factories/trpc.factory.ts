import { Inject, Injectable } from '@nestjs/common';
import { AnyRouter } from '@trpc/server';
import { RouterFactory } from './router.factory';
import { TRPCRouter } from '../interfaces/factory.interface';

@Injectable()
export class TRPCFactory {
  @Inject(RouterFactory)
  private readonly routerFactory!: RouterFactory;

  serializeAppRoutes(router: TRPCRouter, procedure: any): AnyRouter {
    const routerSchema = this.routerFactory.serializeRoutes(router, procedure);
    return router(routerSchema);
  }
}
