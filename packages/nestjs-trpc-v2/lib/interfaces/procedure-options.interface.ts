export type ProcedureOptions = {
  ctx: any;
  input: any;
  meta: any;
  type: string;
  path: string;
  rawInput: string;
  signal?: AbortSignal;
};
