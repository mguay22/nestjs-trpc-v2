import 'reflect-metadata';
import { Subscription } from '../subscription.decorator';
import {
  PROCEDURE_METADATA_KEY,
  PROCEDURE_TYPE_KEY,
} from '../../trpc.constants';
import { ProcedureType } from '../../trpc.enum';
import { z } from 'zod';

describe('Subscription Decorator', () => {
  it('should set procedure type metadata to Subscription', () => {
    class TestClass {
      @Subscription()
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      PROCEDURE_TYPE_KEY,
      TestClass.prototype.testMethod,
    );
    expect(metadata).toBe(ProcedureType.Subscription);
  });

  it('should set procedure metadata with input and output schemas', () => {
    const inputSchema = z.object({ lastEventId: z.string().optional() });
    const outputSchema = z.object({ message: z.string() });

    class TestClass {
      @Subscription({ input: inputSchema, output: outputSchema })
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      PROCEDURE_METADATA_KEY,
      TestClass.prototype.testMethod,
    );
    expect(metadata).toEqual({ input: inputSchema, output: outputSchema });
  });

  it('should set procedure metadata without schemas', () => {
    class TestClass {
      @Subscription()
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      PROCEDURE_METADATA_KEY,
      TestClass.prototype.testMethod,
    );
    expect(metadata).toBeUndefined();
  });

  it('should set procedure metadata with only input schema', () => {
    const inputSchema = z.object({ cursor: z.number().optional() });

    class TestClass {
      @Subscription({ input: inputSchema })
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      PROCEDURE_METADATA_KEY,
      TestClass.prototype.testMethod,
    );
    expect(metadata).toEqual({ input: inputSchema });
  });

  it('should set procedure metadata with only output schema', () => {
    const outputSchema = z.object({ data: z.string() });

    class TestClass {
      @Subscription({ output: outputSchema })
      testMethod() {}
    }

    const metadata = Reflect.getMetadata(
      PROCEDURE_METADATA_KEY,
      TestClass.prototype.testMethod,
    );
    expect(metadata).toEqual({ output: outputSchema });
  });
});
