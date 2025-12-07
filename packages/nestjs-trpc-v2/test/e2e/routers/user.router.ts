import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation, Input } from '../../../lib';
import { z } from 'zod';

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

@Injectable()
@Router()
export class UserRouter {
  @Query({ output: z.array(userSchema) })
  async getUsers() {
    return [
      { id: 1, name: 'Alice', email: 'alice@example.com' },
      { id: 2, name: 'Bob', email: 'bob@example.com' },
    ];
  }

  @Query({ input: z.object({ id: z.number() }), output: userSchema })
  async getUserById(@Input() input: { id: number }) {
    return { id: input.id, name: 'Alice', email: 'alice@example.com' };
  }

  @Mutation({ input: createUserSchema, output: userSchema })
  async createUser(@Input() input: z.infer<typeof createUserSchema>) {
    return { id: 3, ...input };
  }
}
