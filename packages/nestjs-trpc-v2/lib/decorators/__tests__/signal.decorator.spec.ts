import 'reflect-metadata';
import { Signal } from '../signal.decorator';
import { PROCEDURE_PARAM_METADATA_KEY } from '../../trpc.constants';
import { ProcedureParamDecoratorType } from '../../interfaces/factory.interface';

describe('Signal Decorator', () => {
  it('should set parameter metadata with Signal type', () => {
    class TestClass {
      testMethod(@Signal() signal: AbortSignal) {
        return signal;
      }
    }

    const metadata = Reflect.getMetadata(
      PROCEDURE_PARAM_METADATA_KEY,
      TestClass.prototype,
      'testMethod',
    );

    expect(metadata).toEqual([
      { type: ProcedureParamDecoratorType.Signal, index: 0 },
    ]);
  });

  it('should work with multiple parameter decorators', () => {
    class TestClass {
      testMethod(
        @Signal() signal: AbortSignal,
        @Signal() anotherSignal: AbortSignal,
      ) {
        return { signal, anotherSignal };
      }
    }

    const metadata = Reflect.getMetadata(
      PROCEDURE_PARAM_METADATA_KEY,
      TestClass.prototype,
      'testMethod',
    );

    expect(metadata).toHaveLength(2);
    expect(metadata).toContainEqual({
      type: ProcedureParamDecoratorType.Signal,
      index: 0,
    });
    expect(metadata).toContainEqual({
      type: ProcedureParamDecoratorType.Signal,
      index: 1,
    });
  });

  it('should preserve parameter index when used with other decorators', () => {
    class TestClass {
      testMethod(input: unknown, @Signal() signal: AbortSignal) {
        return signal;
      }
    }

    const metadata = Reflect.getMetadata(
      PROCEDURE_PARAM_METADATA_KEY,
      TestClass.prototype,
      'testMethod',
    );

    expect(metadata).toEqual([
      { type: ProcedureParamDecoratorType.Signal, index: 1 },
    ]);
  });
});
