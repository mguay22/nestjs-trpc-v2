import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { initTRPC } from '@trpc/server';

describe('NestJS tRPC E2E Tests', () => {
  let moduleFixture: TestingModule;
  let appRouter: any;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    await moduleFixture.init();

    const { procedure, router } = initTRPC.context().create();
    const TRPCFactory = (await import('../../lib/factories/trpc.factory'))
      .TRPCFactory;
    const trpcFactory = moduleFixture.get(TRPCFactory);
    appRouter = trpcFactory.serializeAppRoutes(router, procedure);
  });

  afterAll(async () => {
    await moduleFixture.close();
  });

  describe('UserRouter', () => {
    it('should get all users', async () => {
      const caller = appRouter.createCaller({});
      const users = await caller.userRouter.getUsers();

      expect(users).toHaveLength(2);
      expect(users[0]).toHaveProperty('id', 1);
      expect(users[0]).toHaveProperty('name', 'Alice');
      expect(users[0]).toHaveProperty('email', 'alice@example.com');
    });

    it('should get user by id', async () => {
      const caller = appRouter.createCaller({});
      const user = await caller.userRouter.getUserById({ id: 1 });

      expect(user).toHaveProperty('id', 1);
      expect(user).toHaveProperty('name', 'Alice');
      expect(user).toHaveProperty('email', 'alice@example.com');
    });

    it('should create a new user', async () => {
      const caller = appRouter.createCaller({});
      const newUser = await caller.userRouter.createUser({
        name: 'Charlie',
        email: 'charlie@example.com',
      });

      expect(newUser).toHaveProperty('id', 3);
      expect(newUser).toHaveProperty('name', 'Charlie');
      expect(newUser).toHaveProperty('email', 'charlie@example.com');
    });
  });

  describe('PostRouter', () => {
    it('should get all posts', async () => {
      const caller = appRouter.createCaller({});
      const posts = await caller.postRouter.getPosts();

      expect(posts).toHaveLength(2);
      expect(posts[0]).toHaveProperty('id', 1);
      expect(posts[0]).toHaveProperty('title', 'First Post');
    });

    it('should get post by id', async () => {
      const caller = appRouter.createCaller({});
      const post = await caller.postRouter.getPostById({ id: 1 });

      expect(post).toHaveProperty('id', 1);
      expect(post).toHaveProperty('title', 'First Post');
      expect(post).toHaveProperty('content', 'Hello World');
    });

    it('should create a new post', async () => {
      const caller = appRouter.createCaller({});
      const newPost = await caller.postRouter.createPost({
        title: 'Third Post',
        content: 'Testing',
        authorId: 1,
      });

      expect(newPost).toHaveProperty('id', 3);
      expect(newPost).toHaveProperty('title', 'Third Post');
      expect(newPost).toHaveProperty('content', 'Testing');
    });
  });

  describe('Router Registration', () => {
    it('should have registered user router', () => {
      expect(appRouter.userRouter).toBeDefined();
      expect(appRouter.userRouter.getUsers).toBeDefined();
      expect(appRouter.userRouter.getUserById).toBeDefined();
      expect(appRouter.userRouter.createUser).toBeDefined();
    });

    it('should have registered post router', () => {
      expect(appRouter.postRouter).toBeDefined();
      expect(appRouter.postRouter.getPosts).toBeDefined();
      expect(appRouter.postRouter.getPostById).toBeDefined();
      expect(appRouter.postRouter.createPost).toBeDefined();
    });

    it('should have registered notification router with subscriptions', () => {
      expect(appRouter.notificationRouter).toBeDefined();
      expect(appRouter.notificationRouter.onNotification).toBeDefined();
      expect(
        appRouter.notificationRouter.onNotificationWithInput,
      ).toBeDefined();
    });
  });

  describe('NotificationRouter (Subscriptions)', () => {
    it('should stream notifications', async () => {
      const caller = appRouter.createCaller({});
      const notifications: Array<{
        id: string;
        message: string;
        timestamp: number;
      }> = [];

      const generator = await (
        caller.notificationRouter.onNotification as any
      )();

      for await (const notification of generator) {
        notifications.push(notification);
        if (notifications.length >= 3) {
          break;
        }
      }

      expect(notifications).toHaveLength(3);
      expect(notifications[0]).toHaveProperty('id');
      expect(notifications[0]).toHaveProperty('message');
      expect(notifications[0]).toHaveProperty('timestamp');
    });

    it('should stream notifications with input', async () => {
      const caller = appRouter.createCaller({});
      const notifications: Array<{
        id: string;
        message: string;
        timestamp: number;
      }> = [];

      const generator = await (
        caller.notificationRouter.onNotificationWithInput as any
      )({ lastEventId: '10' });

      for await (const notification of generator) {
        notifications.push(notification);
        if (notifications.length >= 2) {
          break;
        }
      }

      expect(notifications).toHaveLength(2);
      expect(parseInt(notifications[0].id, 10)).toBeGreaterThanOrEqual(10);
    });
  });
});
