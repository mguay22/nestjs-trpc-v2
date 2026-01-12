import type { TRPCModuleOptions } from '../interfaces';

export interface GeneratorModuleOptions {
  rootModuleFilePath: TRPCModuleOptions['autoSchemaFile'];
  context?: TRPCModuleOptions['context'];
  outputDirPath?: string;
  schemaFileImports?: TRPCModuleOptions['schemaFileImports'];
  transformer?: TRPCModuleOptions['transformer'];
}
