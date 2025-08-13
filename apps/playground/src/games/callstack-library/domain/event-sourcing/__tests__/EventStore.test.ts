/**
 * EventStore 단위 테스트
 * 
 * Event Sourcing의 핵심 구성요소인 EventStore의 모든 기능을 검증합니다.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  InMemoryEventStore,
  EventBuilder,
  createEvent,
  DomainEvent,
  EventMetadata,
  EventStream
} from '@/games/callstack-library/EventStore';

describe('EventStore', () => {
  let eventStore: InMemoryEventStore;
  let sampleEvent: DomainEvent;
  let sampleMetadata: EventMetadata;

  beforeEach(() => {
    eventStore = new InMemoryEventStore();
    
    sampleMetadata = {
      sessionId: 'test-session',
      source: 'test',
      userId: 'user-123',
      causationId: 'command-456',
      correlationId: 'process-789'
    };

    sampleEvent = createEvent(
      'UserCreated',
      'user-123',
      'User',
      1,
      { name: 'John Doe', email: 'john@example.com' },
      sampleMetadata
    );
  });

  describe('InMemoryEventStore', () => {
    describe('appendEvents', () => {
      it('빈 이벤트 배열은 아무 작업하지 않고 반환해야 한다', async () => {
        await eventStore.appendEvents('stream-1', 0, []);
        
        const events = await eventStore.getEvents('stream-1');
        expect(events).toHaveLength(0);
      });

      it('새로운 스트림에 이벤트를 추가할 수 있어야 한다', async () => {
        await eventStore.appendEvents('stream-1', 0, [sampleEvent]);
        
        const events = await eventStore.getEvents('stream-1');
        expect(events).toHaveLength(1);
        expect(events[0]).toEqual(sampleEvent);
      });

      it('기존 스트림에 이벤트를 추가할 수 있어야 한다', async () => {
        const event2 = createEvent(
          'UserUpdated',
          'user-123',
          'User',
          2,
          { name: 'Jane Doe' },
          sampleMetadata
        );

        await eventStore.appendEvents('stream-1', 0, [sampleEvent]);
        await eventStore.appendEvents('stream-1', 1, [event2]);
        
        const events = await eventStore.getEvents('stream-1');
        expect(events).toHaveLength(2);
        expect(events[0]).toEqual(sampleEvent);
        expect(events[1]).toEqual(event2);
      });

      it('예상 버전이 다르면 동시성 충돌 에러를 던져야 한다', async () => {
        await eventStore.appendEvents('stream-1', 0, [sampleEvent]);
        
        const event2 = createEvent(
          'UserUpdated',
          'user-123',
          'User',
          2,
          { name: 'Jane Doe' },
          sampleMetadata
        );

        await expect(
          eventStore.appendEvents('stream-1', 0, [event2])
        ).rejects.toThrow('Concurrency conflict: expected version 0, but current version is 1');
      });

      it('잘못된 이벤트 버전이면 에러를 던져야 한다', async () => {
        const invalidEvent = createEvent(
          'UserCreated',
          'user-123',
          'User',
          3, // 잘못된 버전 (1이어야 함)
          { name: 'John Doe' },
          sampleMetadata
        );

        await expect(
          eventStore.appendEvents('stream-1', 0, [invalidEvent])
        ).rejects.toThrow('Invalid event version: expected 1, got 3');
      });

      it('여러 이벤트의 버전이 순차적이지 않으면 에러를 던져야 한다', async () => {
        const event1 = createEvent('Event1', 'agg-1', 'Aggregate', 1, {}, sampleMetadata);
        const event3 = createEvent('Event3', 'agg-1', 'Aggregate', 3, {}, sampleMetadata); // 잘못된 버전

        await expect(
          eventStore.appendEvents('stream-1', 0, [event1, event3])
        ).rejects.toThrow('Invalid event version: expected 2, got 3');
      });

      it('이벤트 추가 시 리스너에게 알림을 보내야 한다', async () => {
        const specificListener = vi.fn();
        const allEventsListener = vi.fn();

        eventStore.subscribe('UserCreated', specificListener);
        eventStore.subscribe('*', allEventsListener);

        await eventStore.appendEvents('stream-1', 0, [sampleEvent]);

        expect(specificListener).toHaveBeenCalledWith(sampleEvent);
        expect(allEventsListener).toHaveBeenCalledWith(sampleEvent);
      });
    });

    describe('getEvents', () => {
      beforeEach(async () => {
        const events = [
          createEvent('Event1', 'agg-1', 'Aggregate', 1, {}, sampleMetadata),
          createEvent('Event2', 'agg-1', 'Aggregate', 2, {}, sampleMetadata),
          createEvent('Event3', 'agg-1', 'Aggregate', 3, {}, sampleMetadata),
        ];
        await eventStore.appendEvents('stream-1', 0, events);
      });

      it('존재하지 않는 스트림에 대해 빈 배열을 반환해야 한다', async () => {
        const events = await eventStore.getEvents('non-existent');
        expect(events).toEqual([]);
      });

      it('스트림의 모든 이벤트를 반환해야 한다', async () => {
        const events = await eventStore.getEvents('stream-1');
        expect(events).toHaveLength(3);
        expect(events[0].version).toBe(1);
        expect(events[1].version).toBe(2);
        expect(events[2].version).toBe(3);
      });

      it('fromVersion을 지정하면 해당 버전부터 반환해야 한다', async () => {
        const events = await eventStore.getEvents('stream-1', 2);
        expect(events).toHaveLength(2);
        expect(events[0].version).toBe(2);
        expect(events[1].version).toBe(3);
      });

      it('toVersion을 지정하면 해당 버전까지 반환해야 한다', async () => {
        const events = await eventStore.getEvents('stream-1', undefined, 2);
        expect(events).toHaveLength(2);
        expect(events[0].version).toBe(1);
        expect(events[1].version).toBe(2);
      });

      it('fromVersion과 toVersion을 모두 지정하면 범위 내의 이벤트만 반환해야 한다', async () => {
        const events = await eventStore.getEvents('stream-1', 2, 2);
        expect(events).toHaveLength(1);
        expect(events[0].version).toBe(2);
      });
    });

    describe('streamExists', () => {
      it('존재하지 않는 스트림에 대해 false를 반환해야 한다', async () => {
        const exists = await eventStore.streamExists('non-existent');
        expect(exists).toBe(false);
      });

      it('존재하는 스트림에 대해 true를 반환해야 한다', async () => {
        await eventStore.appendEvents('stream-1', 0, [sampleEvent]);
        
        const exists = await eventStore.streamExists('stream-1');
        expect(exists).toBe(true);
      });
    });

    describe('getStreamInfo', () => {
      it('존재하지 않는 스트림에 대해 null을 반환해야 한다', async () => {
        const info = await eventStore.getStreamInfo('non-existent');
        expect(info).toBeNull();
      });

      it('존재하는 스트림의 정보를 반환해야 한다', async () => {
        await eventStore.appendEvents('stream-1', 0, [sampleEvent]);
        
        const info = await eventStore.getStreamInfo('stream-1');
        expect(info).not.toBeNull();
        expect(info!.streamId).toBe('stream-1');
        expect(info!.version).toBe(1);
        expect(info!.events).toHaveLength(1);
      });
    });

    describe('getEventsByType', () => {
      beforeEach(async () => {
        const events = [
          createEvent('UserCreated', 'user-1', 'User', 1, {}, sampleMetadata),
          createEvent('UserUpdated', 'user-1', 'User', 2, {}, sampleMetadata),
          createEvent('UserCreated', 'user-2', 'User', 1, {}, sampleMetadata),
          createEvent('OrderCreated', 'order-1', 'Order', 1, {}, sampleMetadata),
        ];
        
        await eventStore.appendEvents('user-1', 0, [events[0], events[1]]);
        await eventStore.appendEvents('user-2', 0, [events[2]]);
        await eventStore.appendEvents('order-1', 0, [events[3]]);
      });

      it('특정 타입의 모든 이벤트를 반환해야 한다', async () => {
        const userCreatedEvents = await eventStore.getEventsByType('UserCreated');
        expect(userCreatedEvents).toHaveLength(2);
        expect(userCreatedEvents.every(e => e.type === 'UserCreated')).toBe(true);
      });

      it('존재하지 않는 타입에 대해 빈 배열을 반환해야 한다', async () => {
        const events = await eventStore.getEventsByType('NonExistentType');
        expect(events).toEqual([]);
      });
    });

    describe('getEventsFrom', () => {
      beforeEach(async () => {
        const baseTime = Date.now();
        const events = [
          { ...createEvent('Event1', 'agg-1', 'Aggregate', 1, {}, sampleMetadata), timestamp: baseTime - 2000 },
          { ...createEvent('Event2', 'agg-1', 'Aggregate', 2, {}, sampleMetadata), timestamp: baseTime - 1000 },
          { ...createEvent('Event3', 'agg-1', 'Aggregate', 3, {}, sampleMetadata), timestamp: baseTime },
        ];
        await eventStore.appendEvents('stream-1', 0, events);
      });

      it('지정된 시간 이후의 이벤트들을 반환해야 한다', async () => {
        const targetTime = Date.now() - 1500;
        const events = await eventStore.getEventsFrom(targetTime);
        expect(events.length).toBeGreaterThanOrEqual(2);
        expect(events.every(e => e.timestamp >= targetTime)).toBe(true);
      });
    });

    describe('getEventsTo', () => {
      beforeEach(async () => {
        const baseTime = Date.now();
        const events = [
          { ...createEvent('Event1', 'agg-1', 'Aggregate', 1, {}, sampleMetadata), timestamp: baseTime - 2000 },
          { ...createEvent('Event2', 'agg-1', 'Aggregate', 2, {}, sampleMetadata), timestamp: baseTime - 1000 },
          { ...createEvent('Event3', 'agg-1', 'Aggregate', 3, {}, sampleMetadata), timestamp: baseTime },
        ];
        await eventStore.appendEvents('stream-1', 0, events);
      });

      it('지정된 시간까지의 이벤트들을 반환해야 한다', async () => {
        const targetTime = Date.now() - 500;
        const events = await eventStore.getEventsTo(targetTime);
        expect(events.length).toBeGreaterThanOrEqual(2);
        expect(events.every(e => e.timestamp <= targetTime)).toBe(true);
      });
    });

    describe('subscribe', () => {
      it('특정 이벤트 타입에 대한 리스너를 등록할 수 있어야 한다', async () => {
        const listener = vi.fn();
        const unsubscribe = eventStore.subscribe('UserCreated', listener);

        await eventStore.appendEvents('stream-1', 0, [sampleEvent]);

        expect(listener).toHaveBeenCalledWith(sampleEvent);
        expect(typeof unsubscribe).toBe('function');
      });

      it('모든 이벤트에 대한 리스너를 등록할 수 있어야 한다', async () => {
        const listener = vi.fn();
        eventStore.subscribe('*', listener);

        await eventStore.appendEvents('stream-1', 0, [sampleEvent]);

        expect(listener).toHaveBeenCalledWith(sampleEvent);
      });

      it('unsubscribe 함수로 리스너를 제거할 수 있어야 한다', async () => {
        const listener = vi.fn();
        const unsubscribe = eventStore.subscribe('UserCreated', listener);

        unsubscribe();

        await eventStore.appendEvents('stream-1', 0, [sampleEvent]);

        expect(listener).not.toHaveBeenCalled();
      });

      it('리스너에서 에러가 발생해도 다른 리스너에 영향을 주지 않아야 한다', async () => {
        const errorListener = vi.fn().mockImplementation(() => {
          throw new Error('Listener error');
        });
        const normalListener = vi.fn();
        
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        eventStore.subscribe('UserCreated', errorListener);
        eventStore.subscribe('UserCreated', normalListener);

        await eventStore.appendEvents('stream-1', 0, [sampleEvent]);

        expect(errorListener).toHaveBeenCalled();
        expect(normalListener).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('Error in event listener for UserCreated:'),
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });

    describe('디버그 메서드들', () => {
      beforeEach(async () => {
        const events = [
          createEvent('Event1', 'agg-1', 'Aggregate', 1, {}, sampleMetadata),
          createEvent('Event2', 'agg-2', 'Aggregate', 1, {}, sampleMetadata),
        ];
        await eventStore.appendEvents('stream-1', 0, [events[0]]);
        await eventStore.appendEvents('stream-2', 0, [events[1]]);
      });

      it('getAllEvents는 모든 이벤트를 반환해야 한다', () => {
        const allEvents = eventStore.getAllEvents();
        expect(allEvents).toHaveLength(2);
      });

      it('getAllStreams는 모든 스트림을 반환해야 한다', () => {
        const allStreams = eventStore.getAllStreams();
        expect(allStreams).toHaveLength(2);
        expect(allStreams.find(s => s.streamId === 'stream-1')).toBeDefined();
        expect(allStreams.find(s => s.streamId === 'stream-2')).toBeDefined();
      });

      it('getEventCount는 총 이벤트 수를 반환해야 한다', () => {
        expect(eventStore.getEventCount()).toBe(2);
      });

      it('getStreamCount는 총 스트림 수를 반환해야 한다', () => {
        expect(eventStore.getStreamCount()).toBe(2);
      });
    });

    describe('clear', () => {
      it('모든 데이터를 초기화해야 한다', async () => {
        await eventStore.appendEvents('stream-1', 0, [sampleEvent]);
        eventStore.subscribe('UserCreated', vi.fn());

        eventStore.clear();

        expect(eventStore.getEventCount()).toBe(0);
        expect(eventStore.getStreamCount()).toBe(0);
        expect(await eventStore.streamExists('stream-1')).toBe(false);
      });
    });

    describe('스냅샷 기능', () => {
      beforeEach(async () => {
        await eventStore.appendEvents('stream-1', 0, [sampleEvent]);
      });

      it('스냅샷을 생성할 수 있어야 한다', () => {
        const snapshot = eventStore.createSnapshot();
        
        expect(snapshot.streams).toHaveLength(1);
        expect(snapshot.allEvents).toHaveLength(1);
        expect(snapshot.timestamp).toBeGreaterThan(0);
      });

      it('스냅샷에서 상태를 복원할 수 있어야 한다', () => {
        const originalSnapshot = eventStore.createSnapshot();
        
        // 새로운 데이터 추가
        const newEvent = createEvent('Event2', 'agg-2', 'Aggregate', 1, {}, sampleMetadata);
        eventStore.appendEvents('stream-2', 0, [newEvent]);
        
        expect(eventStore.getEventCount()).toBe(2);
        
        // 스냅샷에서 복원
        eventStore.restoreFromSnapshot(originalSnapshot);
        
        expect(eventStore.getEventCount()).toBe(1);
        expect(eventStore.getStreamCount()).toBe(1);
      });
    });
  });

  describe('EventBuilder', () => {
    it('static create 메서드로 빌더를 생성할 수 있어야 한다', () => {
      const builder = EventBuilder.create();
      expect(builder).toBeInstanceOf(EventBuilder);
    });

    it('체이닝을 통해 이벤트를 구성할 수 있어야 한다', () => {
      const event = EventBuilder.create()
        .withId('evt-123')
        .withType('UserCreated')
        .withAggregateId('user-456')
        .withAggregateType('User')
        .withVersion(1)
        .withPayload({ name: 'John' })
        .withMetadata(sampleMetadata)
        .withTimestamp(12345)
        .build();

      expect(event.id).toBe('evt-123');
      expect(event.type).toBe('UserCreated');
      expect(event.aggregateId).toBe('user-456');
      expect(event.aggregateType).toBe('User');
      expect(event.version).toBe(1);
      expect(event.payload).toEqual({ name: 'John' });
      expect(event.metadata).toEqual(sampleMetadata);
      expect(event.timestamp).toBe(12345);
    });

    it('ID가 제공되지 않으면 자동으로 생성해야 한다', () => {
      const event = EventBuilder.create()
        .withType('UserCreated')
        .withAggregateId('user-456')
        .withAggregateType('User')
        .withVersion(1)
        .withPayload({})
        .build();

      expect(event.id).toMatch(/^evt_\d+_[a-z0-9]+$/);
    });

    it('타임스탬프가 제공되지 않으면 현재 시간을 사용해야 한다', () => {
      const before = Date.now();
      const event = EventBuilder.create()
        .withType('UserCreated')
        .withAggregateId('user-456')
        .withAggregateType('User')
        .withVersion(1)
        .withPayload({})
        .build();
      const after = Date.now();

      expect(event.timestamp).toBeGreaterThanOrEqual(before);
      expect(event.timestamp).toBeLessThanOrEqual(after);
    });

    it('withTimestamp를 매개변수 없이 호출하면 현재 시간을 설정해야 한다', () => {
      const before = Date.now();
      const event = EventBuilder.create()
        .withType('UserCreated')
        .withAggregateId('user-456')
        .withAggregateType('User')
        .withVersion(1)
        .withPayload({})
        .withTimestamp()
        .build();
      const after = Date.now();

      expect(event.timestamp).toBeGreaterThanOrEqual(before);
      expect(event.timestamp).toBeLessThanOrEqual(after);
    });

    it('필수 필드가 누락되면 에러를 던져야 한다', () => {
      expect(() => {
        EventBuilder.create()
          .withType('UserCreated')
          // aggregateId 누락
          .withAggregateType('User')
          .withVersion(1)
          .withPayload({})
          .build();
      }).toThrow("Required field 'aggregateId' is missing");
    });

    it('모든 필수 필드가 누락된 경우에도 적절한 에러를 던져야 한다', () => {
      expect(() => {
        EventBuilder.create().build();
      }).toThrow("Required field 'type' is missing");
    });
  });

  describe('createEvent', () => {
    it('모든 필수 매개변수로 이벤트를 생성할 수 있어야 한다', () => {
      const event = createEvent(
        'UserCreated',
        'user-123',
        'User',
        1,
        { name: 'John' }
      );

      expect(event.type).toBe('UserCreated');
      expect(event.aggregateId).toBe('user-123');
      expect(event.aggregateType).toBe('User');
      expect(event.version).toBe(1);
      expect(event.payload).toEqual({ name: 'John' });
      expect(event.metadata?.sessionId).toBe('default');
      expect(event.metadata?.source).toBe('system');
    });

    it('메타데이터를 오버라이드할 수 있어야 한다', () => {
      const customMetadata = {
        sessionId: 'custom-session',
        source: 'api',
        userId: 'user-456'
      };

      const event = createEvent(
        'UserCreated',
        'user-123',
        'User',
        1,
        { name: 'John' },
        customMetadata
      );

      expect(event.metadata?.sessionId).toBe('custom-session');
      expect(event.metadata?.source).toBe('api');
      expect(event.metadata?.userId).toBe('user-456');
    });

    it('기본 메타데이터와 커스텀 메타데이터를 병합해야 한다', () => {
      const event = createEvent(
        'UserCreated',
        'user-123',
        'User',
        1,
        { name: 'John' },
        { userId: 'user-456' }
      );

      expect(event.metadata?.sessionId).toBe('default');
      expect(event.metadata?.source).toBe('system');
      expect(event.metadata?.userId).toBe('user-456');
    });
  });
});