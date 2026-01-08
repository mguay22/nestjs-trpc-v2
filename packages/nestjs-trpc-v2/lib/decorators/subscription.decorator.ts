import { ZodSchema } from 'zod';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { PROCEDURE_METADATA_KEY, PROCEDURE_TYPE_KEY } from '../trpc.constants';
import { ProcedureType } from '../trpc.enum';

/**
 * Decorator that marks a router class method as a tRPC subscription procedure.
 * Subscriptions use async generators to stream real-time events to clients via SSE.
 *
 * A tRPC subscription procedure is responsible for streaming real-time data to clients.
 * The method should be an async generator function that yields values over time.
 *
 * @param {object} args configuration object specifying:
 * - `input` - defines a `ZodSchema` validation logic for the input.
 * - `output` - defines a `ZodSchema` validation logic for yielded values.
 *
 * @example
 * ```typescript
 * @Subscription({ output: z.object({ message: z.string() }) })
 * async *onMessage(@Signal() signal?: AbortSignal) {
 *   while (!signal?.aborted) {
 *     yield { message: 'Hello' };
 *     await new Promise(resolve => setTimeout(resolve, 1000));
 *   }
 * }
 * ```
 *
 * @see [Subscriptions](https://nestjs-trpc-v2.io/docs/subscriptions)
 *
 * @publicApi
 */
export function Subscription(args?: { input?: ZodSchema; output?: ZodSchema }) {
  return applyDecorators(
    ...[
      SetMetadata(PROCEDURE_TYPE_KEY, ProcedureType.Subscription),
      SetMetadata(PROCEDURE_METADATA_KEY, args),
    ],
  );
}
