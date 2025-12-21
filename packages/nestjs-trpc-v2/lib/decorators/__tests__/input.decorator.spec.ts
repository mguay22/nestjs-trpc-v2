import 'reflect-metadata';
import { Input } from '../input.decorator';
import { PROCEDURE_PARAM_METADATA_KEY } from '../../trpc.constants';
import { ProcedureParamDecoratorType } from '../../interfaces/factory.interface';

describe('Input Decorator', () => {
  class TestClass {
    testMethod(
      @Input() _param1: unknown,
      @Input('key') _paramparam2: unknown,
    ) {}
  }

  it('should add metadata to the method', () => {
    const metadata = Reflect.getMetadata(
      PROCEDURE_PARAM_METADATA_KEY,
      TestClass.prototype,
      'testMethod',
    );
    expect(metadata).toBeDefined();
    expect(Array.isArray(metadata)).toBe(true);
  });

  it('should add correct metadata for each parameter', () => {
    const metadata = Reflect.getMetadata(
      PROCEDURE_PARAM_METADATA_KEY,
      TestClass.prototype,
      'testMethod',
    );
    expect(metadata).toHaveLength(2);

    expect(metadata[0]).toEqual({
      type: ProcedureParamDecoratorType.Input,
      index: 1,
      key: 'key',
    });

    expect(metadata[1]).toEqual({
      type: ProcedureParamDecoratorType.Input,
      index: 0,
      key: undefined,
    });
  });

  it('should append to existing metadata', () => {
    class TestClassWithExistingMetadata {
      testMethod(@Input() _param1: unknown) {}
    }

    // Simulate existing metadata
    const existingMetadata = [{ type: 'SomeOtherDecorator', index: 0 }];
    Reflect.defineMetadata(
      PROCEDURE_PARAM_METADATA_KEY,
      existingMetadata,
      TestClassWithExistingMetadata.prototype,
      'testMethod',
    );

    // Apply our decorator
    Input('newKey')(TestClassWithExistingMetadata.prototype, 'testMethod', 1);

    const metadata = Reflect.getMetadata(
      PROCEDURE_PARAM_METADATA_KEY,
      TestClassWithExistingMetadata.prototype,
      'testMethod',
    );
    expect(metadata).toHaveLength(2);
    expect(metadata[1]).toEqual({
      type: ProcedureParamDecoratorType.Input,
      index: 1,
      key: 'newKey',
    });
  });
});
