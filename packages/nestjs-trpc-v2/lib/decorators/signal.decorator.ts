import {
  ProcedureParamDecorator,
  ProcedureParamDecoratorType,
} from '../interfaces/factory.interface';
import { PROCEDURE_PARAM_METADATA_KEY } from '../trpc.constants';

/**
 * Signal procedure parameter decorator. Extracts the `AbortSignal` from the procedure options.
 * Use this in subscription procedures to detect when the client disconnects.
 *
 * @example
 * ```typescript
 * @Subscription({ output: z.object({ count: z.number() }) })
 * async *counter(@Signal() signal?: AbortSignal) {
 *   let count = 0;
 *   while (!signal?.aborted) {
 *     yield { count: count++ };
 *     await new Promise(resolve => setTimeout(resolve, 1000));
 *   }
 * }
 * ```
 *
 * @see [Subscriptions](https://nestjs-trpc-v2.io/docs/subscriptions)
 *
 * @publicApi
 */
export function Signal(): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    if (propertyKey != null) {
      const existingParams: Array<ProcedureParamDecorator> =
        Reflect.getMetadata(
          PROCEDURE_PARAM_METADATA_KEY,
          target,
          propertyKey,
        ) || [];

      const procedureParamMetadata: ProcedureParamDecorator = {
        type: ProcedureParamDecoratorType.Signal,
        index: parameterIndex,
      };
      existingParams.push(procedureParamMetadata);
      Reflect.defineMetadata(
        PROCEDURE_PARAM_METADATA_KEY,
        existingParams,
        target,
        propertyKey,
      );
    }
  };
}
