import {
  SourceFile,
  StructureKind,
  Type,
  VariableDeclarationKind,
} from 'ts-morph';
import { Injectable } from '@nestjs/common';
import { SourceFileImportsMap } from '../interfaces/generator.interface';
import * as path from 'node:path';

@Injectable()
export class StaticGenerator {
  public generateStaticDeclaration(sourceFile: SourceFile): void {
    sourceFile.addImportDeclaration({
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: '@trpc/server',
      namedImports: ['initTRPC'],
    });
    sourceFile.addImportDeclaration({
      kind: StructureKind.ImportDeclaration,
      moduleSpecifier: 'zod',
      namedImports: ['z'],
    });

    sourceFile.addVariableStatements([
      {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [{ name: 't', initializer: 'initTRPC.create()' }],
      },
      {
        declarationKind: VariableDeclarationKind.Const,
        declarations: [{ name: 'publicProcedure', initializer: 't.procedure' }],
      },
    ]);
  }

  public addSchemaImports(
    sourceFile: SourceFile,
    schemaImportNames: Array<string>,
    importsMap: Map<string, SourceFileImportsMap>,
  ): void {
    // Group imports by module specifier to deduplicate and organize
    const importsByModule = new Map<string, Set<string>>();

    for (const schemaImportName of schemaImportNames) {
      for (const [importMapKey, importMapMetadata] of importsMap.entries()) {
        if (schemaImportName == null || importMapKey !== schemaImportName) {
          continue;
        }

        let moduleSpecifier: string;

        // Check if this is an external/workspace import
        if (importMapMetadata.moduleSpecifier != null) {
          // Use the preserved module specifier for external imports
          moduleSpecifier = importMapMetadata.moduleSpecifier;
        } else if (importMapMetadata.sourceFile != null) {
          // Calculate relative path for local imports
          const relativePath = path.relative(
            path.dirname(sourceFile.getFilePath()),
            importMapMetadata.sourceFile.getFilePath().replace(/\.ts$/, ''),
          );
          moduleSpecifier = relativePath.startsWith('.')
            ? relativePath
            : `./${relativePath}`;
        } else {
          continue;
        }

        // Add to the set for this module specifier
        if (!importsByModule.has(moduleSpecifier)) {
          importsByModule.set(moduleSpecifier, new Set());
        }
        importsByModule.get(moduleSpecifier)!.add(schemaImportName);
      }
    }

    // Add or merge import declarations
    for (const [moduleSpecifier, namedImportsSet] of importsByModule) {
      const existingImport = sourceFile
        .getImportDeclarations()
        .find((imp) => imp.getModuleSpecifierValue() === moduleSpecifier);

      if (existingImport) {
        // Merge with existing import
        const existingNamedImports = existingImport
          .getNamedImports()
          .map((ni) => ni.getName());
        const newImports = Array.from(namedImportsSet).filter(
          (name) => !existingNamedImports.includes(name),
        );
        if (newImports.length > 0) {
          existingImport.addNamedImports(newImports);
        }
      } else {
        // Create new import declaration
        sourceFile.addImportDeclaration({
          kind: StructureKind.ImportDeclaration,
          moduleSpecifier,
          namedImports: Array.from(namedImportsSet),
        });
      }
    }
  }

  public findCtxOutProperty(type: Type): string | undefined {
    const typeText = type.getText();
    const ctxOutMatch = typeText.match(/_ctx_out:\s*{([^}]*)}/);

    return ctxOutMatch ? ctxOutMatch[1].trim() : undefined;
  }
}
