import { Injectable } from '@nestjs/common';
import { Project, SourceFile } from 'ts-morph';
import { SourceFileImportsMap } from '../interfaces/generator.interface';
import { createRequire } from 'node:module';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class ImportsScanner {
  public buildSourceFileImportsMap(
    sourceFile: SourceFile,
    project: Project,
  ): Map<string, SourceFileImportsMap> {
    const sourceFileImportsMap = new Map<string, SourceFileImportsMap>();
    const importDeclarations = sourceFile.getImportDeclarations();

    for (const importDeclaration of importDeclarations) {
      const namedImports = importDeclaration.getNamedImports();
      for (const namedImport of namedImports) {
        const name = namedImport.getName();
        let importedSourceFile =
          importDeclaration.getModuleSpecifierSourceFile();

        // If it resolved to a .d.ts file, try to find the TypeScript source instead
        if (
          importedSourceFile &&
          importedSourceFile.getFilePath().endsWith('.d.ts')
        ) {
          const tsSourcePath = this.findTypeScriptSource(
            importedSourceFile.getFilePath(),
          );

          if (tsSourcePath) {
            const tsSourceFile =
              project.addSourceFileAtPathIfExists(tsSourcePath);
            if (tsSourceFile) {
              importedSourceFile = tsSourceFile;
            }
          }
        }

        if (importedSourceFile == null) {
          // Try to resolve using Node's module resolution
          const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
          const resolvedPath = this.resolveModuleUsingNode(
            moduleSpecifier,
            sourceFile.getFilePath(),
          );

          if (resolvedPath) {
            // Add the resolved file to the project and try again
            importedSourceFile =
              project.addSourceFileAtPathIfExists(resolvedPath);
          }

          if (importedSourceFile == null) {
            continue;
          }
        }

        const resolvedSourceFile =
          importedSourceFile.getFilePath().endsWith('index.ts') &&
            !importedSourceFile.getVariableDeclaration(name)
            ? this.resolveBarrelFileImport(importedSourceFile, name, project)
            : importedSourceFile;

        if (resolvedSourceFile == null) {
          continue;
        }

        // Generalized logic to handle various kinds of declarations
        const declaration =
          resolvedSourceFile.getVariableDeclaration(name) ||
          resolvedSourceFile.getClass(name) ||
          resolvedSourceFile.getInterface(name) ||
          resolvedSourceFile.getEnum(name) ||
          resolvedSourceFile.getFunction(name);

        if (declaration != null) {
          const initializer =
            'getInitializer' in declaration
              ? declaration.getInitializer()
              : declaration;
          sourceFileImportsMap.set(name, {
            initializer: initializer ?? declaration,
            sourceFile: resolvedSourceFile,
          });
        }
      }
    }

    return sourceFileImportsMap;
  }

  /**
   * https://github.com/dsherret/ts-morph/issues/327
   * Note that if the module resolution of the compiler is Classic then it won't resolve those implicit index.ts module specifiers.
   * So for example, if the moduleResolution compiler option isn't explicitly set then setting the module
   * compiler option to anything but ModuleKind.CommonJS will cause the module resolution kind to resolve to Classic.
   * Additionally, if moduleResolution and the module compiler option isn't set,
   * then a script target of ES2015 and above will also use Classic module resolution.
   */
  private resolveBarrelFileImport(
    barrelSourceFile: SourceFile,
    name: string,
    project: Project,
  ): SourceFile | undefined {
    // Traverse through export declarations to find the actual source of the named import
    for (const exportDeclaration of barrelSourceFile.getExportDeclarations()) {
      const exportedSourceFile =
        exportDeclaration.getModuleSpecifierSourceFile();
      if (exportedSourceFile == null) continue;

      // Check if the named export is explicitly re-exported
      const namedExports = exportDeclaration.getNamedExports();
      if (namedExports.length > 0) {
        const matchingExport = namedExports.find((e) => e.getName() === name);
        if (matchingExport) {
          return exportedSourceFile;
        }
      } else {
        // Handle `export * from ...` case: recursively resolve the export
        const schemaVariable = exportedSourceFile.getVariableDeclaration(name);
        if (schemaVariable) {
          return exportedSourceFile;
        } else {
          // Continue resolving if it's another barrel file
          const baseSourceFile = this.resolveBarrelFileImport(
            exportedSourceFile,
            name,
            project,
          );
          if (baseSourceFile) return baseSourceFile;
        }
      }
    }

    return undefined;
  }

  private resolveModuleUsingNode(
    moduleSpecifier: string,
    fromFile: string,
  ): string | undefined {
    // Only try to resolve non-relative imports (workspace packages, node_modules, etc.)
    if (moduleSpecifier.startsWith('.') || moduleSpecifier.startsWith('/')) {
      return undefined;
    }

    try {
      const require = createRequire(fromFile);
      const resolvedPath = require.resolve(moduleSpecifier);

      // Try to find the TypeScript source file instead of compiled output
      const tsSourcePath = this.findTypeScriptSource(resolvedPath);

      if (tsSourcePath && fs.existsSync(tsSourcePath)) {
        return tsSourcePath;
      }

      // Fallback: Convert .js/.d.ts to .ts if possible
      const tsPath = resolvedPath
        .replace(/\.js$/, '.ts')
        .replace(/\.d\.ts$/, '.ts');

      if (fs.existsSync(tsPath)) {
        return tsPath;
      }

      return undefined;
    } catch (error) {
      // Module couldn't be resolved, skip it
      return undefined;
    }
  }

  private findTypeScriptSource(compiledPath: string): string | undefined {
    // If it's a .d.ts file in dist/, try to find the source in src/
    // Example: /path/to/package/dist/index.d.ts -> /path/to/package/src/index.ts
    if (compiledPath.includes('/dist/')) {
      const srcPath = compiledPath
        .replace('/dist/', '/src/')
        .replace(/\.d\.ts$/, '.ts')
        .replace(/\.js$/, '.ts');

      if (fs.existsSync(srcPath)) {
        return srcPath;
      }
    }

    // Try other common patterns: lib/, build/, out/
    const patterns = ['/lib/', '/build/', '/out/'];
    for (const pattern of patterns) {
      if (compiledPath.includes(pattern)) {
        const srcPath = compiledPath
          .replace(pattern, '/src/')
          .replace(/\.d\.ts$/, '.ts')
          .replace(/\.js$/, '.ts');

        if (fs.existsSync(srcPath)) {
          return srcPath;
        }
      }
    }

    // Try to find package.json and read the source location
    const packageDir = this.findPackageDirectory(compiledPath);

    if (packageDir) {
      const packageJsonPath = path.join(packageDir, 'package.json');

      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, 'utf8'),
          );

          // Try common source field patterns
          const sourceFields = [
            'source',
            'typescript:main',
            'typings',
            'types',
          ];
          for (const field of sourceFields) {
            if (packageJson[field]) {
              const sourcePath = path.join(packageDir, packageJson[field]);
              if (fs.existsSync(sourcePath) && sourcePath.endsWith('.ts')) {
                return sourcePath;
              }
            }
          }

          // Fallback: try src/index.ts
          const srcIndexPath = path.join(packageDir, 'src', 'index.ts');
          if (fs.existsSync(srcIndexPath)) {
            return srcIndexPath;
          }
        } catch {
          // Failed to read package.json, continue
        }
      }
    }

    return undefined;
  }

  private findPackageDirectory(filePath: string): string | undefined {
    let currentDir = path.dirname(filePath);
    const root = path.parse(currentDir).root;

    while (currentDir !== root) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }

    return undefined;
  }
}
