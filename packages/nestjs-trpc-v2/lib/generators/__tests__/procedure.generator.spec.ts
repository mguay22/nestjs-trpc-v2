import { Test, TestingModule } from '@nestjs/testing';
import { Project, SourceFile } from 'ts-morph';
import { ProcedureGeneratorMetadata } from '../../interfaces/generator.interface';
import { ProcedureGenerator } from '../procedure.generator';
import { ImportsScanner } from '../../scanners/imports.scanner';
import { StaticGenerator } from '../static.generator';
import { TYPESCRIPT_APP_ROUTER_SOURCE_FILE } from '../generator.constants';

describe('ProcedureGenerator', () => {
  let procedureGenerator: ProcedureGenerator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcedureGenerator,
        {
          provide: ImportsScanner,
          useValue: jest.fn(),
        },
        {
          provide: StaticGenerator,
          useValue: jest.fn(),
        },
        {
          provide: TYPESCRIPT_APP_ROUTER_SOURCE_FILE,
          useValue: jest.fn(),
        },
      ],
    }).compile();

    procedureGenerator = module.get<ProcedureGenerator>(ProcedureGenerator);
  });

  it('should be defined', () => {
    expect(procedureGenerator).toBeDefined();
  });

  describe('generateRoutersStringFromMetadata', () => {
    describe('for a query', () => {
      it('should generate router string from metadata', () => {
        const mockProcedure: ProcedureGeneratorMetadata = {
          name: 'testQuery',
          decorators: [{ name: 'Query', arguments: {} }],
        };

        const result =
          procedureGenerator.generateProcedureString(mockProcedure);

        expect(result).toBe(
          'testQuery: publicProcedure.query(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any )',
        );
      });
    });

    describe('for a mutation', () => {
      it('should generate router string from metadata', () => {
        const mockProcedure: ProcedureGeneratorMetadata = {
          name: 'testMutation',
          decorators: [{ name: 'Mutation', arguments: {} }],
        };

        const result =
          procedureGenerator.generateProcedureString(mockProcedure);

        expect(result).toBe(
          'testMutation: publicProcedure.mutation(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any )',
        );
      });
    });

    describe('for a subscription', () => {
      it('should generate router string from metadata', () => {
        const mockProcedure: ProcedureGeneratorMetadata = {
          name: 'testSubscription',
          decorators: [{ name: 'Subscription', arguments: {} }],
        };

        const result =
          procedureGenerator.generateProcedureString(mockProcedure);

        expect(result).toBe(
          'testSubscription: publicProcedure.subscription(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any )',
        );
      });

      it('should generate subscription with input schema', () => {
        const mockProcedure: ProcedureGeneratorMetadata = {
          name: 'onNotification',
          decorators: [
            {
              name: 'Subscription',
              arguments: { input: 'z.object({ lastEventId: z.string() })' },
            },
          ],
        };

        const result =
          procedureGenerator.generateProcedureString(mockProcedure);

        expect(result).toBe(
          'onNotification: publicProcedure.input(z.object({ lastEventId: z.string() })).subscription(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any )',
        );
      });
    });
  });
});

describe('ProcedureGenerator - flattenZodSchema', () => {
  let procedureGenerator: ProcedureGenerator;
  let project: Project;
  let appRouterSourceFile: SourceFile;

  beforeEach(async () => {
    project = new Project();
    appRouterSourceFile = project.createSourceFile('/test/app-router.ts', '', {
      overwrite: true,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcedureGenerator,
        ImportsScanner,
        {
          provide: StaticGenerator,
          useValue: {
            addSchemaImports: jest.fn(),
          },
        },
        {
          provide: TYPESCRIPT_APP_ROUTER_SOURCE_FILE,
          useValue: appRouterSourceFile,
        },
      ],
    }).compile();

    procedureGenerator = module.get<ProcedureGenerator>(ProcedureGenerator);
  });

  describe('basic schema flattening', () => {
    it('should return the schema unchanged for simple z expressions', () => {
      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `const schema = z.string();`,
        { overwrite: true },
      );

      const declaration = sourceFile.getVariableDeclaration('schema');
      const initializer = declaration!.getInitializer()!;

      const result = procedureGenerator.flattenZodSchema(
        initializer,
        sourceFile,
        project,
        initializer.getText(),
      );

      expect(result).toBe('z.string()');
    });

    it('should flatten local variable references', () => {
      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `
        const baseSchema = z.string();
        const mainSchema = z.object({ name: baseSchema });
        `,
        { overwrite: true },
      );

      const declaration = sourceFile.getVariableDeclaration('mainSchema');
      const initializer = declaration!.getInitializer()!;

      const result = procedureGenerator.flattenZodSchema(
        initializer,
        sourceFile,
        project,
        initializer.getText(),
      );

      expect(result).toBe('z.object({ name: z.string() })');
    });
  });

  describe('imported schema flattening', () => {
    it('should flatten schemas imported from another file', () => {
      project.createSourceFile(
        '/test/schema.ts',
        `export const userNameSchema = z.string().min(1);`,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `
        import { userNameSchema } from './schema';
        const userSchema = z.object({ name: userNameSchema });
        `,
        { overwrite: true },
      );

      const declaration = sourceFile.getVariableDeclaration('userSchema');
      const initializer = declaration!.getInitializer()!;

      const result = procedureGenerator.flattenZodSchema(
        initializer,
        sourceFile,
        project,
        initializer.getText(),
      );

      expect(result).toBe('z.object({ name: z.string().min(1) })');
    });

    it('should flatten nested schema references from imported files', () => {
      // Simulates external package with schemas that reference each other
      project.createSourceFile(
        '/test/external/schemas.ts',
        `
        export const statusSchema = z.enum(['pending', 'running', 'completed', 'failed']);
        export const executionSchema = z.object({
          status: statusSchema,
          id: z.string().optional(),
        });
        export const outputSchema = z.object({
          runId: z.string().optional(),
          executions: z.array(executionSchema).optional(),
        });
        `,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `
        import { outputSchema } from './external/schemas';
        const mySchema = outputSchema;
        `,
        { overwrite: true },
      );

      const declaration = sourceFile.getVariableDeclaration('mySchema');
      const initializer = declaration!.getInitializer()!;

      const result = procedureGenerator.flattenZodSchema(
        initializer,
        sourceFile,
        project,
        initializer.getText(),
      );

      // The nested executionSchema should be fully inlined, including its statusSchema reference
      expect(result).toContain('z.object({');
      expect(result).toContain('runId: z.string().optional()');
      expect(result).toContain('executions: z.array(z.object({');
      expect(result).toContain(
        `status: z.enum(['pending', 'running', 'completed', 'failed'])`,
      );
      expect(result).toContain('id: z.string().optional()');
      expect(result).not.toContain('executionSchema');
      expect(result).not.toContain('statusSchema');
    });
  });

  describe('method chain handling', () => {
    it('should flatten schemas inside z.array().optional()', () => {
      project.createSourceFile(
        '/test/schema.ts',
        `export const itemSchema = z.object({ id: z.string() });`,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `
        import { itemSchema } from './schema';
        const listSchema = z.array(itemSchema).optional();
        `,
        { overwrite: true },
      );

      const declaration = sourceFile.getVariableDeclaration('listSchema');
      const initializer = declaration!.getInitializer()!;

      const result = procedureGenerator.flattenZodSchema(
        initializer,
        sourceFile,
        project,
        initializer.getText(),
      );

      expect(result).toBe('z.array(z.object({ id: z.string() })).optional()');
    });

    it('should flatten schemas inside z.array().nullable().optional()', () => {
      project.createSourceFile(
        '/test/schema.ts',
        `export const itemSchema = z.object({ value: z.number() });`,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `
        import { itemSchema } from './schema';
        const listSchema = z.array(itemSchema).nullable().optional();
        `,
        { overwrite: true },
      );

      const declaration = sourceFile.getVariableDeclaration('listSchema');
      const initializer = declaration!.getInitializer()!;

      const result = procedureGenerator.flattenZodSchema(
        initializer,
        sourceFile,
        project,
        initializer.getText(),
      );

      expect(result).toBe(
        'z.array(z.object({ value: z.number() })).nullable().optional()',
      );
    });

    it('should flatten deeply nested method chains', () => {
      project.createSourceFile(
        '/test/schema.ts',
        `export const innerSchema = z.string().min(1);`,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `
        import { innerSchema } from './schema';
        const wrapperSchema = z.object({
          items: z.array(z.object({ value: innerSchema })).optional()
        });
        `,
        { overwrite: true },
      );

      const declaration = sourceFile.getVariableDeclaration('wrapperSchema');
      const initializer = declaration!.getInitializer()!;

      const result = procedureGenerator.flattenZodSchema(
        initializer,
        sourceFile,
        project,
        initializer.getText(),
      );

      expect(result).toBe(
        'z.object({\n          items: z.array(z.object({ value: z.string().min(1) })).optional()\n        })',
      );
    });
  });

  describe('complex nested schemas', () => {
    it('should flatten multiple levels of nested imports', () => {
      // Create a chain of schema files that reference each other
      project.createSourceFile(
        '/test/schemas/base.ts',
        `export const idSchema = z.string().uuid();`,
        { overwrite: true },
      );

      project.createSourceFile(
        '/test/schemas/entity.ts',
        `
        import { idSchema } from './base';
        export const entitySchema = z.object({
          id: idSchema,
          createdAt: z.date(),
        });
        `,
        { overwrite: true },
      );

      project.createSourceFile(
        '/test/schemas/user.ts',
        `
        import { entitySchema } from './entity';
        export const userSchema = z.object({
          entity: entitySchema,
          name: z.string(),
        });
        `,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `
        import { userSchema } from './schemas/user';
        const outputSchema = userSchema;
        `,
        { overwrite: true },
      );

      const declaration = sourceFile.getVariableDeclaration('outputSchema');
      const initializer = declaration!.getInitializer()!;

      const result = procedureGenerator.flattenZodSchema(
        initializer,
        sourceFile,
        project,
        initializer.getText(),
      );

      // All nested schemas should be fully inlined
      expect(result).toContain('z.object({');
      expect(result).toContain('name: z.string()');
      expect(result).toContain('entity: z.object({');
      expect(result).toContain('id: z.string().uuid()');
      expect(result).toContain('createdAt: z.date()');
      expect(result).not.toContain('userSchema');
      expect(result).not.toContain('entitySchema');
      expect(result).not.toContain('idSchema');
    });

    it('should handle schemas with z.union and imported types', () => {
      project.createSourceFile(
        '/test/schema.ts',
        `
        export const typeASchema = z.object({ type: z.literal('a'), valueA: z.string() });
        export const typeBSchema = z.object({ type: z.literal('b'), valueB: z.number() });
        `,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `
        import { typeASchema, typeBSchema } from './schema';
        const unionSchema = z.union([typeASchema, typeBSchema]);
        `,
        { overwrite: true },
      );

      const declaration = sourceFile.getVariableDeclaration('unionSchema');
      const initializer = declaration!.getInitializer()!;

      const result = procedureGenerator.flattenZodSchema(
        initializer,
        sourceFile,
        project,
        initializer.getText(),
      );

      expect(result).toContain(
        "z.object({ type: z.literal('a'), valueA: z.string() })",
      );
      expect(result).toContain(
        "z.object({ type: z.literal('b'), valueB: z.number() })",
      );
      expect(result).not.toContain('typeASchema');
      expect(result).not.toContain('typeBSchema');
    });
  });

  describe('edge cases', () => {
    it('should handle enum schemas referenced inside objects', () => {
      project.createSourceFile(
        '/test/schema.ts',
        `export const statusEnum = z.enum(['active', 'inactive', 'pending']);`,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `
        import { statusEnum } from './schema';
        const recordSchema = z.object({ status: statusEnum });
        `,
        { overwrite: true },
      );

      const declaration = sourceFile.getVariableDeclaration('recordSchema');
      const initializer = declaration!.getInitializer()!;

      const result = procedureGenerator.flattenZodSchema(
        initializer,
        sourceFile,
        project,
        initializer.getText(),
      );

      expect(result).toBe(
        `z.object({ status: z.enum(['active', 'inactive', 'pending']) })`,
      );
    });

    it('should handle z.record with imported value schema', () => {
      project.createSourceFile(
        '/test/schema.ts',
        `export const valueSchema = z.number().positive();`,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `
        import { valueSchema } from './schema';
        const mapSchema = z.record(z.string(), valueSchema);
        `,
        { overwrite: true },
      );

      const declaration = sourceFile.getVariableDeclaration('mapSchema');
      const initializer = declaration!.getInitializer()!;

      const result = procedureGenerator.flattenZodSchema(
        initializer,
        sourceFile,
        project,
        initializer.getText(),
      );

      expect(result).toBe('z.record(z.string(), z.number().positive())');
    });

    it('should handle z.tuple with imported schemas', () => {
      project.createSourceFile(
        '/test/schema.ts',
        `
        export const firstSchema = z.string();
        export const secondSchema = z.number();
        `,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `
        import { firstSchema, secondSchema } from './schema';
        const tupleSchema = z.tuple([firstSchema, secondSchema]);
        `,
        { overwrite: true },
      );

      const declaration = sourceFile.getVariableDeclaration('tupleSchema');
      const initializer = declaration!.getInitializer()!;

      const result = procedureGenerator.flattenZodSchema(
        initializer,
        sourceFile,
        project,
        initializer.getText(),
      );

      expect(result).toBe('z.tuple([z.string(), z.number()])');
    });
  });

  describe('schema extension handling', () => {
    it('should flatten schema.extend() without duplicating .extend', () => {
      project.createSourceFile(
        '/test/schema.ts',
        `
        export const userSchema = z.object({
          id: z.string(),
          name: z.string(),
        });

        export const userWithFollowingSchema = userSchema.extend({
          isFollowing: z.boolean(),
        });
        `,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `
        import { userWithFollowingSchema } from './schema';
        const outputSchema = userWithFollowingSchema;
        `,
        { overwrite: true },
      );

      const declaration = sourceFile.getVariableDeclaration('outputSchema');
      const initializer = declaration!.getInitializer()!;

      const result = procedureGenerator.flattenZodSchema(
        initializer,
        sourceFile,
        project,
        initializer.getText(),
      );

      // Should have exactly one .extend, not .extend.extend
      expect(result).toContain('.extend({');
      expect(result).not.toContain('.extend.extend');
      expect(result).toContain('isFollowing: z.boolean()');
      expect(result).toContain('id: z.string()');
      expect(result).toContain('name: z.string()');
    });

    it('should flatten z.array of extended schema', () => {
      project.createSourceFile(
        '/test/schema.ts',
        `
        export const baseSchema = z.object({
          id: z.string(),
        });

        export const extendedSchema = baseSchema.extend({
          extra: z.number(),
        });
        `,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `
        import { extendedSchema } from './schema';
        const arraySchema = z.array(extendedSchema);
        `,
        { overwrite: true },
      );

      const declaration = sourceFile.getVariableDeclaration('arraySchema');
      const initializer = declaration!.getInitializer()!;

      const result = procedureGenerator.flattenZodSchema(
        initializer,
        sourceFile,
        project,
        initializer.getText(),
      );

      expect(result).toContain('z.array(');
      expect(result).toContain('.extend({');
      expect(result).not.toContain('.extend.extend');
      expect(result).toContain('extra: z.number()');
    });

    it('should handle chained methods after extend', () => {
      project.createSourceFile(
        '/test/schema.ts',
        `
        export const baseSchema = z.object({ id: z.string() });
        export const extendedSchema = baseSchema.extend({ name: z.string() }).optional();
        `,
        { overwrite: true },
      );

      const sourceFile = project.createSourceFile(
        '/test/router.ts',
        `
        import { extendedSchema } from './schema';
        const outputSchema = extendedSchema;
        `,
        { overwrite: true },
      );

      const declaration = sourceFile.getVariableDeclaration('outputSchema');
      const initializer = declaration!.getInitializer()!;

      const result = procedureGenerator.flattenZodSchema(
        initializer,
        sourceFile,
        project,
        initializer.getText(),
      );

      expect(result).toContain('.extend({');
      expect(result).toContain('.optional()');
      expect(result).not.toContain('.extend.extend');
    });
  });
});
