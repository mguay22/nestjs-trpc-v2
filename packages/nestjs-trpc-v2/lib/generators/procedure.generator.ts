import { Inject, Injectable } from '@nestjs/common';
import {
  ProcedureGeneratorMetadata,
  SourceFileImportsMap,
} from '../interfaces/generator.interface';
import { ProcedureType } from '../trpc.enum';
import { Project, SourceFile, Node } from 'ts-morph';
import { ImportsScanner } from '../scanners/imports.scanner';
import { StaticGenerator } from './static.generator';
import { TYPESCRIPT_APP_ROUTER_SOURCE_FILE } from './generator.constants';

@Injectable()
export class ProcedureGenerator {
  @Inject(ImportsScanner)
  private readonly importsScanner!: ImportsScanner;

  @Inject(StaticGenerator)
  private readonly staticGenerator!: StaticGenerator;

  @Inject(TYPESCRIPT_APP_ROUTER_SOURCE_FILE)
  private readonly appRouterSourceFile!: SourceFile;

  public generateProcedureString(
    procedure: ProcedureGeneratorMetadata,
  ): string {
    const { name, decorators } = procedure;
    const decorator = decorators.find(
      (decorator) =>
        decorator.name === ProcedureType.Mutation ||
        decorator.name === ProcedureType.Query ||
        decorator.name === ProcedureType.Subscription,
    );

    if (!decorator) {
      return '';
    }

    const decoratorArgumentsArray = Object.entries(decorator.arguments)
      .map(([key, value]) => `.${key}(${value})`)
      .join('');

    return `${name}: publicProcedure${decoratorArgumentsArray}.${decorator.name.toLowerCase()}(async () => "PLACEHOLDER_DO_NOT_REMOVE" as any )`;
  }

  public flattenZodSchema(
    node: Node,
    sourceFile: SourceFile,
    project: Project,
    schema: string,
    providedImportsMap?: Map<string, SourceFileImportsMap>,
  ): string {
    const importsMap =
      providedImportsMap ??
      this.importsScanner.buildSourceFileImportsMap(sourceFile, project);
    if (Node.isIdentifier(node)) {
      const identifierName = node.getText();
      const identifierDeclaration =
        sourceFile?.getVariableDeclaration(identifierName);

      if (identifierDeclaration != null) {
        const identifierInitializer = identifierDeclaration.getInitializer();

        if (identifierInitializer != null) {
          const identifierSchema = this.flattenZodSchema(
            identifierInitializer,
            sourceFile,
            project,
            identifierInitializer.getText(),
            importsMap,
          );

          schema = schema.replace(identifierName, identifierSchema);
        }
      } else if (importsMap.has(identifierName)) {
        const importedIdentifier = importsMap.get(identifierName);

        if (importedIdentifier != null) {
          const { initializer, sourceFile: importedSourceFile } =
            importedIdentifier;

          if (initializer == null || importedSourceFile == null) {
            // Can't flatten external imports, add to imports and keep as-is
            this.staticGenerator.addSchemaImports(
              this.appRouterSourceFile,
              [identifierName],
              importsMap,
            );
          } else {
            // Build a new imports map for the imported source file to resolve its own dependencies
            const importedImportsMap =
              this.importsScanner.buildSourceFileImportsMap(
                importedSourceFile,
                project,
              );
            const identifierSchema = this.flattenZodSchema(
              initializer,
              importedSourceFile,
              project,
              initializer.getText(),
              importedImportsMap,
            );

            schema = schema.replace(identifierName, identifierSchema);
          }
        }
      }
    } else if (Node.isObjectLiteralExpression(node)) {
      for (const property of node.getProperties()) {
        if (Node.isPropertyAssignment(property)) {
          const propertyText = property.getText();
          const propertyInitializer = property.getInitializer();

          if (propertyInitializer != null) {
            schema = schema.replace(
              propertyText,
              this.flattenZodSchema(
                propertyInitializer,
                sourceFile,
                project,
                propertyText,
                importsMap,
              ),
            );
          }
        }
      }
    } else if (Node.isArrayLiteralExpression(node)) {
      for (const element of node.getElements()) {
        const elementText = element.getText();
        schema = schema.replace(
          elementText,
          this.flattenZodSchema(
            element,
            sourceFile,
            project,
            elementText,
            importsMap,
          ),
        );
      }
    } else if (Node.isCallExpression(node)) {
      const expression = node.getExpression();
      if (
        Node.isPropertyAccessExpression(expression) &&
        !expression.getText().startsWith('z')
      ) {
        const baseExpression = expression.getExpression();
        const baseSchema = this.flattenZodSchema(
          baseExpression,
          sourceFile,
          project,
          baseExpression.getText(),
          importsMap,
        );
        const propertyName = expression.getName();
        schema = schema.replace(
          expression.getText(),
          `${baseSchema}.${propertyName}`,
        );
      } else if (Node.isPropertyAccessExpression(expression)) {
        // Handle method chains like z.array(schema).optional()
        // The expression is something.optional, we need to recurse into the base if it's a call
        const baseExpression = expression.getExpression();
        if (Node.isCallExpression(baseExpression)) {
          // Recursively process the base call expression (e.g., z.array(schema))
          const baseText = baseExpression.getText();
          const flattenedBase = this.flattenZodSchema(
            baseExpression,
            sourceFile,
            project,
            baseText,
            importsMap,
          );
          schema = schema.replace(baseText, flattenedBase);
        }
      } else if (!expression.getText().startsWith('z')) {
        this.staticGenerator.addSchemaImports(
          this.appRouterSourceFile,
          [expression.getText()],
          importsMap,
        );
      }

      for (const arg of node.getArguments()) {
        const argText = arg.getText();
        schema = schema.replace(
          argText,
          this.flattenZodSchema(arg, sourceFile, project, argText, importsMap),
        );
      }
    } else if (Node.isPropertyAccessExpression(node)) {
      schema = schema.replace(
        node.getExpression().getText(),
        this.flattenZodSchema(
          node.getExpression(),
          sourceFile,
          project,
          node.getExpression().getText(),
          importsMap,
        ),
      );
    }

    return schema;
  }
}
