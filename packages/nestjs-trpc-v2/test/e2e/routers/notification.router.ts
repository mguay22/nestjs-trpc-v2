import { Injectable } from '@nestjs/common';
import { Router, Subscription, Input, Signal } from '../../../lib';
import { z } from 'zod';

@Injectable()
@Router()
export class NotificationRouter {
  @Subscription()
  async *onNotification(@Signal() signal?: AbortSignal) {
    let id = 0;
    while (!signal?.aborted) {
      yield {
        id: String(id),
        message: `Notification ${id}`,
        timestamp: Date.now(),
      };
      id++;
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (id > 10) break;
    }
  }

  @Subscription({
    input: z.object({ lastEventId: z.string().optional() }),
  })
  async *onNotificationWithInput(
    @Input() input: { lastEventId?: string },
    @Signal() signal?: AbortSignal,
  ) {
    let id = input.lastEventId ? parseInt(input.lastEventId, 10) : 0;
    while (!signal?.aborted) {
      yield {
        id: String(id),
        message: `Notification ${id}`,
        timestamp: Date.now(),
      };
      id++;
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (id > 20) break;
    }
  }
}
