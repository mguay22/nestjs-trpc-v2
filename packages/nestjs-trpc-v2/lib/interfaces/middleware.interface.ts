import type { ProcedureType } from '@trpc/server';

export type MiddlewareResponse =
  | Promise<any>
  | (<$Context>(opts: { ctx: $Context }) => Promise<any>);

export type MiddlewareOptions<TContext extends object = object> = {
  ctx: TContext;
  type: ProcedureType;
  path: string;
  input: unknown;
  rawInput: unknown;
  meta: unknown;
  next: (opts?: { ctx: Record<string, unknown> }) => Promise<any>;
};

export interface TRPCMiddleware {
  use(
    opts: MiddlewareOptions,
  ): MiddlewareResponse | Promise<MiddlewareResponse>;
}
