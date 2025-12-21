import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation, Input } from '../../../lib';
import { z } from 'zod';

const postSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  authorId: z.number(),
});

const createPostSchema = z.object({
  title: z.string(),
  content: z.string(),
  authorId: z.number(),
});

@Injectable()
@Router()
export class PostRouter {
  @Query({ output: z.array(postSchema) })
  async getPosts() {
    return [
      { id: 1, title: 'First Post', content: 'Hello World', authorId: 1 },
      { id: 2, title: 'Second Post', content: 'Goodbye World', authorId: 2 },
    ];
  }

  @Query({ input: z.object({ id: z.number() }), output: postSchema })
  async getPostById(@Input() input: { id: number }) {
    return {
      id: input.id,
      title: 'First Post',
      content: 'Hello World',
      authorId: 1,
    };
  }

  @Mutation({ input: createPostSchema, output: postSchema })
  async createPost(@Input() input: z.infer<typeof createPostSchema>) {
    return { id: 3, ...input };
  }
}
