import { Project, SourceFile } from 'ts-morph';
import { StaticGenerator } from '../static.generator';
import { TransformerOptions } from '../../interfaces';

describe('StaticGenerator', () => {
  let project: Project;
  let sourceFile: SourceFile;
  let generator: StaticGenerator;

  beforeEach(() => {
    project = new Project();
    sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });
    generator = new StaticGenerator();
  });

  function getFileText() {
    return sourceFile.getFullText();
  }

  it('should generate base imports and t without transformer', () => {
    generator.generateStaticDeclaration(sourceFile);

    const text = getFileText();

    expect(text).toContain(`import { initTRPC } from "@trpc/server";`);
    expect(text).toContain(`import { z } from "zod";`);
    expect(text).toContain(`const t = initTRPC.create();`);
    expect(text).toContain(`const publicProcedure = t.procedure;`);
  });

  it('should support runtime-only transformer (no static import)', () => {
    const transformer: TransformerOptions = {
      runtime: {
        serialize: jest.fn(),
        deserialize: jest.fn(),
      },
    };

    generator.generateStaticDeclaration(sourceFile, transformer);

    const text = getFileText();

    // No import
    expect(text).not.toContain(`import superjson`);
    expect(text).not.toContain(`transformer:`);

    // Falls back to plain initTRPC.create()
    expect(text).toContain(`const t = initTRPC.create();`);
  });

  it('should generate transformer import and wire it into initTRPC when fully defined', () => {
    const transformer: TransformerOptions = {
      runtime: {
        serialize: jest.fn(),
        deserialize: jest.fn(),
      },
      importName: 'superjson',
      importPath: 'superjson',
    };

    generator.generateStaticDeclaration(sourceFile, transformer);

    const text = getFileText();

    expect(text).toContain(`import superjson from "superjson";`);
    expect(text).toContain(
      `const t = initTRPC.create({ transformer: superjson });`,
    );
  });

  it('should add schema imports via addSchemaImports()', () => {
    const schemaSource = project.createSourceFile('schema.ts', '', {
      overwrite: true,
    });

    const importsMap = new Map([
      [
        'MySchema',
        {
          sourceFile: schemaSource,
        },
      ],
    ]);

    generator.addSchemaImports(sourceFile, ['MySchema'], importsMap as any);

    const text = getFileText();
    expect(text).toContain(`import { MySchema } from "./schema"`);
  });
});
