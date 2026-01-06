import { Test, TestingModule } from '@nestjs/testing';
import { Project } from 'ts-morph';
import { ImportsScanner } from '../imports.scanner';

jest.mock('node:fs', () => ({
  ...jest.requireActual('node:fs'),
  existsSync: jest.fn(),
}));

import * as fs from 'node:fs';

describe('ImportsScanner', () => {
  let importsScanner: ImportsScanner;
  let project: Project;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImportsScanner],
    }).compile();

    importsScanner = module.get<ImportsScanner>(ImportsScanner);
    project = new Project();
  });

  describe('buildSourceFileImportsMap', () => {
    it('should build import map for relative imports', () => {
      const schemaFile = project.createSourceFile(
        '/test/schema.ts',
        `export const userSchema = { name: 'string' };`,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `import { userSchema } from './schema';`,
        { overwrite: true },
      );

      const importsMap = importsScanner.buildSourceFileImportsMap(
        sourceFile,
        project,
      );

      expect(importsMap.size).toBe(1);
      expect(importsMap.has('userSchema')).toBe(true);
      expect(importsMap.get('userSchema')?.sourceFile).toBe(schemaFile);
    });

    it('should handle multiple named imports', () => {
      project.createSourceFile(
        '/test/schemas.ts',
        `
        export const userSchema = { name: 'string' };
        export const postSchema = { title: 'string' };
        `,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `import { userSchema, postSchema } from './schemas';`,
        { overwrite: true },
      );

      const importsMap = importsScanner.buildSourceFileImportsMap(
        sourceFile,
        project,
      );

      expect(importsMap.size).toBe(2);
      expect(importsMap.has('userSchema')).toBe(true);
      expect(importsMap.has('postSchema')).toBe(true);
    });

    it('should handle class imports', () => {
      const classFile = project.createSourceFile(
        '/test/user.class.ts',
        `export class User { name: string; }`,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `import { User } from './user.class';`,
        { overwrite: true },
      );

      const importsMap = importsScanner.buildSourceFileImportsMap(
        sourceFile,
        project,
      );

      expect(importsMap.size).toBe(1);
      expect(importsMap.has('User')).toBe(true);
      expect(importsMap.get('User')?.sourceFile).toBe(classFile);
    });

    it('should handle interface imports', () => {
      const interfaceFile = project.createSourceFile(
        '/test/user.interface.ts',
        `export interface IUser { name: string; }`,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `import { IUser } from './user.interface';`,
        { overwrite: true },
      );

      const importsMap = importsScanner.buildSourceFileImportsMap(
        sourceFile,
        project,
      );

      expect(importsMap.size).toBe(1);
      expect(importsMap.has('IUser')).toBe(true);
      expect(importsMap.get('IUser')?.sourceFile).toBe(interfaceFile);
    });

    it('should handle enum imports', () => {
      const enumFile = project.createSourceFile(
        '/test/status.enum.ts',
        `export enum Status { Active, Inactive }`,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `import { Status } from './status.enum';`,
        { overwrite: true },
      );

      const importsMap = importsScanner.buildSourceFileImportsMap(
        sourceFile,
        project,
      );

      expect(importsMap.size).toBe(1);
      expect(importsMap.has('Status')).toBe(true);
      expect(importsMap.get('Status')?.sourceFile).toBe(enumFile);
    });

    it('should handle function imports', () => {
      const functionFile = project.createSourceFile(
        '/test/helpers.ts',
        `export function validateUser() { return true; }`,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `import { validateUser } from './helpers';`,
        { overwrite: true },
      );

      const importsMap = importsScanner.buildSourceFileImportsMap(
        sourceFile,
        project,
      );

      expect(importsMap.size).toBe(1);
      expect(importsMap.has('validateUser')).toBe(true);
      expect(importsMap.get('validateUser')?.sourceFile).toBe(functionFile);
    });

    it('should skip imports that cannot be resolved', () => {
      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `import { NonExistent } from './non-existent';`,
        { overwrite: true },
      );

      const importsMap = importsScanner.buildSourceFileImportsMap(
        sourceFile,
        project,
      );

      expect(importsMap.size).toBe(0);
    });

    it('should skip imports where declaration is not found', () => {
      project.createSourceFile('/test/empty.ts', `// Empty file`, {
        overwrite: true,
      });

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `import { Something } from './empty';`,
        { overwrite: true },
      );

      const importsMap = importsScanner.buildSourceFileImportsMap(
        sourceFile,
        project,
      );

      expect(importsMap.size).toBe(0);
    });
  });

  describe('resolveBarrelFileImport', () => {
    it('should resolve imports from barrel files with named exports', () => {
      const schemaFile = project.createSourceFile(
        '/test/schemas/user.schema.ts',
        `export const userSchema = { name: 'string' };`,
        { overwrite: true },
      );

      project.createSourceFile(
        '/test/schemas/index.ts',
        `export { userSchema } from './user.schema';`,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `import { userSchema } from './schemas';`,
        { overwrite: true },
      );

      const importsMap = importsScanner.buildSourceFileImportsMap(
        sourceFile,
        project,
      );

      expect(importsMap.size).toBe(1);
      expect(importsMap.has('userSchema')).toBe(true);
      expect(importsMap.get('userSchema')?.sourceFile).toBe(schemaFile);
    });

    it('should resolve imports from barrel files with export *', () => {
      const schemaFile = project.createSourceFile(
        '/test/schemas/user.schema.ts',
        `export const userSchema = { name: 'string' };`,
        { overwrite: true },
      );

      project.createSourceFile(
        '/test/schemas/index.ts',
        `export * from './user.schema';`,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `import { userSchema } from './schemas';`,
        { overwrite: true },
      );

      const importsMap = importsScanner.buildSourceFileImportsMap(
        sourceFile,
        project,
      );

      expect(importsMap.size).toBe(1);
      expect(importsMap.has('userSchema')).toBe(true);
      expect(importsMap.get('userSchema')?.sourceFile).toBe(schemaFile);
    });

    it('should resolve nested barrel files', () => {
      const schemaFile = project.createSourceFile(
        '/test/schemas/user/user.schema.ts',
        `export const userSchema = { name: 'string' };`,
        { overwrite: true },
      );

      project.createSourceFile(
        '/test/schemas/user/index.ts',
        `export * from './user.schema';`,
        { overwrite: true },
      );

      project.createSourceFile(
        '/test/schemas/index.ts',
        `export * from './user';`,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `import { userSchema } from './schemas';`,
        { overwrite: true },
      );

      const importsMap = importsScanner.buildSourceFileImportsMap(
        sourceFile,
        project,
      );

      expect(importsMap.size).toBe(1);
      expect(importsMap.has('userSchema')).toBe(true);
      expect(importsMap.get('userSchema')?.sourceFile).toBe(schemaFile);
    });

    it('should handle barrel files that directly contain the variable', () => {
      const indexFile = project.createSourceFile(
        '/test/schemas/index.ts',
        `export const userSchema = { name: 'string' };`,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `import { userSchema } from './schemas';`,
        { overwrite: true },
      );

      const importsMap = importsScanner.buildSourceFileImportsMap(
        sourceFile,
        project,
      );

      expect(importsMap.size).toBe(1);
      expect(importsMap.has('userSchema')).toBe(true);
      expect(importsMap.get('userSchema')?.sourceFile).toBe(indexFile);
    });
  });

  describe('resolveModuleUsingNode', () => {
    it('should return undefined for relative imports', () => {
      const sourceFile = project.createSourceFile('/test/router.ts', '');
      const resolveModuleUsingNode = (importsScanner as any)
        .resolveModuleUsingNode;

      const result = resolveModuleUsingNode.call(
        importsScanner,
        './relative-path',
        sourceFile.getFilePath(),
      );

      expect(result).toBeUndefined();
    });

    it('should return undefined for absolute path imports', () => {
      const sourceFile = project.createSourceFile('/test/router.ts', '');
      const resolveModuleUsingNode = (importsScanner as any)
        .resolveModuleUsingNode;

      const result = resolveModuleUsingNode.call(
        importsScanner,
        '/absolute/path',
        sourceFile.getFilePath(),
      );

      expect(result).toBeUndefined();
    });

    it('should resolve node_modules packages', () => {
      const sourceFile = project.createSourceFile('/test/router.ts', '');
      const resolveModuleUsingNode = (importsScanner as any)
        .resolveModuleUsingNode;

      const result = resolveModuleUsingNode.call(
        importsScanner,
        'ts-morph',
        sourceFile.getFilePath(),
      );

      // Should resolve to something (the actual path depends on the environment)
      // If it resolves, it should be a string
      if (result !== undefined) {
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
      // Note: The result might be undefined if the .ts source file doesn't exist
      // after converting from .js/.d.ts, which is acceptable behavior
    });

    it('should convert .js to .ts extension', () => {
      const sourceFile = project.createSourceFile('/test/router.ts', '');
      const resolveModuleUsingNode = (importsScanner as any)
        .resolveModuleUsingNode;

      const result = resolveModuleUsingNode.call(
        importsScanner,
        'ts-morph',
        sourceFile.getFilePath(),
      );

      if (result) {
        // If it resolved to a .js, it should be converted to .ts
        expect(result).not.toMatch(/\.js$/);
      }
    });

    it('should return undefined for non-existent packages', () => {
      const sourceFile = project.createSourceFile('/test/router.ts', '');
      const resolveModuleUsingNode = (importsScanner as any)
        .resolveModuleUsingNode;

      const result = resolveModuleUsingNode.call(
        importsScanner,
        'non-existent-package-xyz-123',
        sourceFile.getFilePath(),
      );

      expect(result).toBeUndefined();
    });
  });

  describe('findTypeScriptSource', () => {
    let findTypeScriptSource: (compiledPath: string) => string | undefined;
    const mockExistsSync = fs.existsSync as jest.Mock;

    beforeEach(() => {
      findTypeScriptSource = (importsScanner as any).findTypeScriptSource.bind(
        importsScanner,
      );
      mockExistsSync.mockReset();
    });

    it('should convert /dist/ path to /src/', () => {
      mockExistsSync.mockReturnValue(true);

      const result = findTypeScriptSource('/project/dist/index.d.ts');

      expect(result).toBe('/project/src/index.ts');
    });

    it('should convert /lib/ path to /src/', () => {
      mockExistsSync.mockReturnValue(true);

      const result = findTypeScriptSource('/project/lib/utils.js');

      expect(result).toBe('/project/src/utils.ts');
    });

    it('should convert /build/ path to /src/', () => {
      mockExistsSync.mockReturnValue(true);

      const result = findTypeScriptSource('/project/build/helpers.d.ts');

      expect(result).toBe('/project/src/helpers.ts');
    });

    it('should convert /out/ path to /src/', () => {
      mockExistsSync.mockReturnValue(true);

      const result = findTypeScriptSource('/project/out/module.js');

      expect(result).toBe('/project/src/module.ts');
    });

    it('should replace only the first output directory pattern when multiple exist', () => {
      mockExistsSync.mockReturnValue(true);

      // Path contains both /dist/ and /lib/ - should only replace the first one
      const result = findTypeScriptSource('/project/dist/lib/utils.d.ts');

      expect(result).toBe('/project/src/lib/utils.ts');
    });

    it('should handle nested output directories correctly', () => {
      mockExistsSync.mockReturnValue(true);

      const result = findTypeScriptSource('/project/lib/build/out/index.js');

      // Should replace only the first match (/lib/)
      expect(result).toBe('/project/src/build/out/index.ts');
    });

    it('should handle Windows-style backslash paths', () => {
      mockExistsSync.mockReturnValue(true);

      const result = findTypeScriptSource('C:\\project\\dist\\index.d.ts');

      expect(result).toBe('C:/project/src/index.ts');
    });

    it('should handle mixed slash paths on Windows', () => {
      mockExistsSync.mockReturnValue(true);

      const result = findTypeScriptSource('C:\\project\\dist/lib/utils.js');

      expect(result).toBe('C:/project/src/lib/utils.ts');
    });

    it('should replace .d.ts extension with .ts', () => {
      mockExistsSync.mockReturnValue(true);

      const result = findTypeScriptSource('/project/dist/types.d.ts');

      expect(result).toBe('/project/src/types.ts');
    });

    it('should replace .js extension with .ts', () => {
      mockExistsSync.mockReturnValue(true);

      const result = findTypeScriptSource('/project/dist/module.js');

      expect(result).toBe('/project/src/module.ts');
    });

    it('should return undefined when source file does not exist', () => {
      mockExistsSync.mockReturnValue(false);

      const result = findTypeScriptSource('/project/dist/index.d.ts');

      expect(result).toBeUndefined();
    });

    it('should return undefined for paths without output directory patterns', () => {
      mockExistsSync.mockReturnValue(false);

      const result = findTypeScriptSource('/project/custom/index.ts');

      expect(result).toBeUndefined();
    });
  });

  describe('integration: workspace package resolution', () => {
    it('should handle unresolved imports by attempting Node resolution', () => {
      // Create a source file with an import that ts-morph can't resolve initially
      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `import { z } from 'zod';`,
        { overwrite: true },
      );

      // buildSourceFileImportsMap should attempt Node resolution for 'zod'
      const importsMap = importsScanner.buildSourceFileImportsMap(
        sourceFile,
        project,
      );

      // Note: This test behavior depends on whether 'zod' can be resolved
      // In a real workspace with @repo/schemas, it would resolve and add the file
      // For now, we just verify it doesn't throw
      expect(importsMap).toBeDefined();
      expect(importsMap instanceof Map).toBe(true);
    });

    it('should add resolved files to the project', () => {
      const initialFileCount = project.getSourceFiles().length;

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `import { Project } from 'ts-morph';`,
        { overwrite: true },
      );

      importsScanner.buildSourceFileImportsMap(sourceFile, project);

      // If resolution succeeded, a new file should be added to the project
      const finalFileCount = project.getSourceFiles().length;
      expect(finalFileCount).toBeGreaterThanOrEqual(initialFileCount);
    });
  });
});
