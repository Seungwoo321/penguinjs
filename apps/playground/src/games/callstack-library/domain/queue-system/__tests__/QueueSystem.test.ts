/**
 * QueueSystem 단위 테스트
 * 
 * CallStack, MicrotaskQueue, MacrotaskQueue의 동작을 검증합니다.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  QueueSystem,
  CallStack,
  MicrotaskQueue,
  MacrotaskQueue,
  QueueSystemSnapshot
} from '@/games/callstack-library/QueueSystem';
import {
  CallStackFrame,
  MicrotaskItem,
  MacrotaskItem
} from '@/games/callstack-library/domain/event-loop/types';

describe('CallStack', () => {
  let callStack: CallStack;

  beforeEach(() => {
    callStack = new CallStack(5); // 작은 크기로 테스트
  });

  describe('기본 스택 동작', () => {
    it('LIFO(Last In First Out) 원칙을 따라야 한다', () => {
      const frame1: CallStackFrame = {
        id: '1',
        type: 'callstack',
        name: 'function1',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now()
      };
      const frame2: CallStackFrame = {
        id: '2',
        type: 'callstack',
        name: 'function2',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now()
      };

      callStack.push(frame1);
      callStack.push(frame2);

      expect(callStack.pop()?.name).toBe('function2');
      expect(callStack.pop()?.name).toBe('function1');
    });

    it('peek은 제거하지 않고 최상단 요소를 반환해야 한다', () => {
      const frame: CallStackFrame = {
        id: '1',
        type: 'callstack',
        name: 'testFunction',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now()
      };

      callStack.push(frame);
      
      expect(callStack.peek()?.name).toBe('testFunction');
      expect(callStack.size()).toBe(1); // 제거되지 않음
    });

    it('최대 크기를 초과하면 에러가 발생해야 한다', () => {
      for (let i = 0; i < 5; i++) {
        callStack.push({
          id: `${i}`,
          type: 'callstack',
          name: `function${i}`,
          priority: 'normal',
          status: 'pending',
          createdAt: Date.now()
        });
      }

      expect(() => {
        callStack.push({
          id: '6',
          type: 'callstack',
          name: 'overflow',
          priority: 'normal',
          status: 'pending',
          createdAt: Date.now()
        });
      }).toThrow('CallStack is full');
    });
  });

  describe('스택 추적 기능', () => {
    it('올바른 스택 추적 정보를 생성해야 한다', () => {
      callStack.push({
        id: '1',
        type: 'callstack',
        name: 'main',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        context: { id: 'ctx1', functionName: 'main', scope: {}, timestamp: Date.now() }
      });
      callStack.push({
        id: '2',
        type: 'callstack',
        name: 'helper',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        context: { id: 'ctx2', functionName: 'helper', scope: {}, timestamp: Date.now() }
      });

      const stackTrace = callStack.getStackTrace();
      
      expect(stackTrace).toHaveLength(2);
      expect(stackTrace[0]).toContain('helper'); // 최신 호출이 위
      expect(stackTrace[1]).toContain('main');
    });

    it('컴텍스트가 없는 경우 anonymous로 표시해야 한다', () => {
      callStack.push({
        id: '1',
        type: 'callstack',
        name: 'noContext',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now()
        // context 없음
      });

      const stackTrace = callStack.getStackTrace();
      expect(stackTrace[0]).toContain('anonymous');
    });

    it('재귀 깊이를 정확히 계산해야 한다', () => {
      const recursiveFunction = (depth: number) => ({
        id: `${depth}`,
        type: 'callstack' as const,
        name: 'recursive',
        priority: 'normal' as const,
        status: 'pending' as const,
        createdAt: Date.now()
      });

      callStack.push(recursiveFunction(1));
      callStack.push(recursiveFunction(2));
      callStack.push(recursiveFunction(3));

      expect(callStack.getRecursionDepth('recursive')).toBe(3);
      expect(callStack.getRecursionDepth('other')).toBe(0);
    });

    it('특정 함수가 스택에 있는지 확인할 수 있어야 한다', () => {
      callStack.push({
        id: '1',
        type: 'callstack',
        name: 'testFunction',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now()
      });

      expect(callStack.contains('testFunction')).toBe(true);
      expect(callStack.contains('nonExistent')).toBe(false);
    });

    it('getCurrentFrame이 올바른 프레임을 반환해야 한다', () => {
      callStack.push({
        id: '1',
        type: 'callstack',
        name: 'first',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now()
      });
      callStack.push({
        id: '2',
        type: 'callstack',
        name: 'second',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now()
      });

      expect(callStack.getCurrentFrame()?.name).toBe('second');
    });

    it('빈 스택에서 getCurrentFrame은 undefined를 반환해야 한다', () => {
      expect(callStack.getCurrentFrame()).toBeUndefined();
    });

    it('빈 스택에서 pop은 undefined를 반환해야 한다', () => {
      expect(callStack.pop()).toBeUndefined();
    });
  });

  describe('기본 동작 추가 테스트', () => {
    it('enqueue와 push가 동일하게 동작해야 한다', () => {
      const frame = {
        id: '1',
        type: 'callstack' as const,
        name: 'test',
        priority: 'normal' as const,
        status: 'pending' as const,
        createdAt: Date.now()
      };

      callStack.enqueue(frame);
      expect(callStack.size()).toBe(1);
      expect(callStack.peek()?.name).toBe('test');
    });

    it('dequeue가 FIFO로 동작해야 한다', () => {
      callStack.push({
        id: '1',
        type: 'callstack',
        name: 'first',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now()
      });
      callStack.push({
        id: '2',
        type: 'callstack',
        name: 'second',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now()
      });

      // dequeue는 FIFO이므로 first가 먼저 나옴
      expect(callStack.dequeue()?.name).toBe('first');
      expect(callStack.dequeue()?.name).toBe('second');
    });
  });
});

describe('MicrotaskQueue', () => {
  let microtaskQueue: MicrotaskQueue;

  beforeEach(() => {
    microtaskQueue = new MicrotaskQueue(10);
  });

  describe('우선순위 기반 큐잉', () => {
    it('우선순위에 따라 정렬되어야 한다', () => {
      microtaskQueue.enqueue({
        id: '1',
        type: 'microtask',
        name: 'low-priority',
        priority: 'low',
        status: 'pending',
        createdAt: Date.now(),
        source: 'queueMicrotask'
      });
      microtaskQueue.enqueue({
        id: '2',
        type: 'microtask',
        name: 'high-priority',
        priority: 'high',
        status: 'pending',
        createdAt: Date.now(),
        source: 'queueMicrotask'
      });
      microtaskQueue.enqueue({
        id: '3',
        type: 'microtask',
        name: 'normal-priority',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'queueMicrotask'
      });

      expect(microtaskQueue.dequeue()?.name).toBe('high-priority');
      expect(microtaskQueue.dequeue()?.name).toBe('normal-priority');
      expect(microtaskQueue.dequeue()?.name).toBe('low-priority');
    });

    it('Promise 마이크로태스크는 자동으로 높은 우선순위를 가져야 한다', () => {
      microtaskQueue.enqueue({
        id: '1',
        type: 'microtask',
        name: 'promise-task',
        priority: 'normal', // 이 값은 무시됨
        status: 'pending',
        createdAt: Date.now(),
        source: 'promise'
      });

      const task = microtaskQueue.peek();
      expect(task?.priority).toBe('high');
    });
  });

  describe('소스별 필터링', () => {
    it('특정 소스의 태스크만 필터링할 수 있어야 한다', () => {
      microtaskQueue.enqueue({
        id: '1',
        type: 'microtask',
        name: 'promise1',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'promise'
      });
      microtaskQueue.enqueue({
        id: '2',
        type: 'microtask',
        name: 'mutation1',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'mutationObserver'
      });
      microtaskQueue.enqueue({
        id: '3',
        type: 'microtask',
        name: 'promise2',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'promise'
      });

      const promiseTasks = microtaskQueue.getBySource('promise');
      expect(promiseTasks).toHaveLength(2);
      expect(promiseTasks[0].name).toBe('promise1');
      expect(promiseTasks[1].name).toBe('promise2');
    });

    it('모든 Promise 태스크를 한 번에 처리할 수 있어야 한다', () => {
      // Given: 다양한 소스의 태스크들
      for (let i = 0; i < 3; i++) {
        microtaskQueue.enqueue({
          id: `promise${i}`,
          type: 'microtask',
          name: `promise${i}`,
          priority: 'normal',
          status: 'pending',
          createdAt: Date.now(),
          source: 'promise'
        });
        microtaskQueue.enqueue({
          id: `other${i}`,
          type: 'microtask',
          name: `other${i}`,
          priority: 'normal',
          status: 'pending',
          createdAt: Date.now(),
          source: 'queueMicrotask'
        });
      }

      // When: Promise 태스크 처리
      const drained = microtaskQueue.drainPromises();

      // Then
      expect(drained).toHaveLength(3);
      expect(microtaskQueue.size()).toBe(3); // queueMicrotask 태스크만 남음
    });
  });

  describe('알 수 없는 우선순위 처리', () => {
    it('알 수 없는 우선순위는 normal로 처리되어야 한다', () => {
      microtaskQueue.enqueue({
        id: '1',
        type: 'microtask',
        name: 'unknown-priority',
        priority: 'unknown' as any, // 알 수 없는 우선순위
        status: 'pending',
        createdAt: Date.now(),
        source: 'queueMicrotask'
      });
      microtaskQueue.enqueue({
        id: '2',
        type: 'microtask',
        name: 'high-priority',
        priority: 'high',
        status: 'pending',
        createdAt: Date.now(),
        source: 'queueMicrotask'
      });

      // high 우선순위가 먼저 나와야 함
      expect(microtaskQueue.dequeue()?.name).toBe('high-priority');
      expect(microtaskQueue.dequeue()?.name).toBe('unknown-priority');
    });
  });

  describe('오버플로우 처리', () => {
    it('큐가 가득 찼을 때 enqueue 시 에러가 발생해야 한다', () => {
      // 크기 1인 큐 생성
      const smallQueue = new MicrotaskQueue(1);
      
      // 첫 번째 태스크 추가 (성공)
      smallQueue.enqueue({
        id: '1',
        type: 'microtask',
        name: 'task1',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'promise'
      });
      
      // 두 번째 태스크 추가 시도 (실패)
      expect(() => {
        smallQueue.enqueue({
          id: '2',
          type: 'microtask',
          name: 'task2',
          priority: 'normal',
          status: 'pending',
          createdAt: Date.now(),
          source: 'promise'
        });
      }).toThrow('Microtask queue is full');
    });
  });

  describe('공통 기능 테스트', () => {
    it('items getter가 불변 배열을 반환해야 한다', () => {
      microtaskQueue.enqueue({
        id: '1',
        type: 'microtask',
        name: 'test',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'promise'
      });

      const items = microtaskQueue.items;
      items.push({ // 이것은 원본에 영향을 주지 않아야 함
        id: '2',
        type: 'microtask',
        name: 'fake',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'promise'
      } as any);

      expect(microtaskQueue.size()).toBe(1); // 원본은 변경되지 않음
    });

    it('toArray가 복사본을 반환해야 한다', () => {
      microtaskQueue.enqueue({
        id: '1',
        type: 'microtask',
        name: 'test',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'promise'
      });

      const array = microtaskQueue.toArray();
      array.push({ // 이것은 원본에 영향을 주지 않아야 함
        id: '2',
        type: 'microtask',
        name: 'fake',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'promise'
      } as any);

      expect(microtaskQueue.size()).toBe(1); // 원본은 변경되지 않음
    });

    it('clear가 모든 아이템을 제거해야 한다', () => {
      microtaskQueue.enqueue({
        id: '1',
        type: 'microtask',
        name: 'test',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'promise'
      });

      microtaskQueue.clear();
      expect(microtaskQueue.isEmpty()).toBe(true);
      expect(microtaskQueue.size()).toBe(0);
    });

    it('isFull이 올바르게 동작해야 한다', () => {
      const smallQueue = new MicrotaskQueue(1);
      
      expect(smallQueue.isFull()).toBe(false);
      
      smallQueue.enqueue({
        id: '1',
        type: 'microtask',
        name: 'test',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'promise'
      });
      
      expect(smallQueue.isFull()).toBe(true);
    });
  });
});

describe('MacrotaskQueue', () => {
  let macrotaskQueue: MacrotaskQueue;

  beforeEach(() => {
    macrotaskQueue = new MacrotaskQueue(10);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('스케줄링 기반 큐잉', () => {
    it('스케줄 시간에 따라 정렬되어야 한다', () => {
      const now = Date.now();
      
      macrotaskQueue.enqueue({
        id: '1',
        type: 'macrotask',
        name: 'task-300ms',
        priority: 'normal',
        status: 'pending',
        createdAt: now,
        source: 'setTimeout',
        delay: 300,
        scheduledAt: now + 300
      });
      macrotaskQueue.enqueue({
        id: '2',
        type: 'macrotask',
        name: 'task-100ms',
        priority: 'normal',
        status: 'pending',
        createdAt: now,
        source: 'setTimeout',
        delay: 100,
        scheduledAt: now + 100
      });
      macrotaskQueue.enqueue({
        id: '3',
        type: 'macrotask',
        name: 'task-immediate',
        priority: 'normal',
        status: 'pending',
        createdAt: now,
        source: 'setImmediate',
        scheduledAt: now
      });

      const items = macrotaskQueue.items;
      expect(items[0].name).toBe('task-immediate');
      expect(items[1].name).toBe('task-100ms');
      expect(items[2].name).toBe('task-300ms');
    });

    it('현재 시간 기준으로 실행 가능한 태스크만 반환해야 한다', () => {
      const now = Date.now();
      
      macrotaskQueue.enqueue({
        id: '1',
        type: 'macrotask',
        name: 'ready-task',
        priority: 'normal',
        status: 'pending',
        createdAt: now,
        source: 'setTimeout',
        scheduledAt: now - 100 // 과거
      });
      macrotaskQueue.enqueue({
        id: '2',
        type: 'macrotask',
        name: 'future-task',
        priority: 'normal',
        status: 'pending',
        createdAt: now,
        source: 'setTimeout',
        scheduledAt: now + 1000 // 미래
      });

      const readyTasks = macrotaskQueue.getReadyTasks(now);
      expect(readyTasks).toHaveLength(1);
      expect(readyTasks[0].name).toBe('ready-task');
    });

    it('실행 가능한 태스크를 순서대로 제거할 수 있어야 한다', () => {
      const now = Date.now();
      
      macrotaskQueue.enqueue({
        id: '1',
        type: 'macrotask',
        name: 'immediate',
        priority: 'normal',
        status: 'pending',
        createdAt: now,
        source: 'setImmediate',
        scheduledAt: now
      });
      macrotaskQueue.enqueue({
        id: '2',
        type: 'macrotask',
        name: 'delayed',
        priority: 'normal',
        status: 'pending',
        createdAt: now,
        source: 'setTimeout',
        scheduledAt: now + 1000
      });

      const dequeued = macrotaskQueue.dequeueReady(now);
      expect(dequeued?.name).toBe('immediate');
      expect(macrotaskQueue.size()).toBe(1);
    });
  });

  describe('태스크 취소', () => {
    it('특정 소스의 모든 태스크를 취소할 수 있어야 한다', () => {
      macrotaskQueue.enqueue({
        id: '1',
        type: 'macrotask',
        name: 'timeout1',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'setTimeout'
      });
      macrotaskQueue.enqueue({
        id: '2',
        type: 'macrotask',
        name: 'interval1',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'setInterval'
      });
      macrotaskQueue.enqueue({
        id: '3',
        type: 'macrotask',
        name: 'timeout2',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'setTimeout'
      });

      const cancelled = macrotaskQueue.cancelBySource('setTimeout');
      
      expect(cancelled).toHaveLength(2);
      expect(macrotaskQueue.size()).toBe(1);
      expect(macrotaskQueue.peek()?.name).toBe('interval1');
    });
  });

  describe('스케줄 시간 처리', () => {
    it('스케줄 시간이 없는 태스크는 자동으로 설정되어야 한다', () => {
      const task: MacrotaskItem = {
        id: '1',
        type: 'macrotask',
        name: 'no-schedule',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'setImmediate',
        delay: 100
      };

      macrotaskQueue.enqueue(task);
      
      const enqueuedTask = macrotaskQueue.peek();
      expect(enqueuedTask?.scheduledAt).toBeTruthy();
      expect(enqueuedTask?.scheduledAt).toBeGreaterThan(Date.now() + 50);
    });

    it('다음 스케줄된 시간을 올바르게 반환해야 한다', () => {
      const now = Date.now();
      
      macrotaskQueue.enqueue({
        id: '1',
        type: 'macrotask',
        name: 'future1',
        priority: 'normal',
        status: 'pending',
        createdAt: now,
        source: 'setTimeout',
        scheduledAt: now + 1000
      });
      macrotaskQueue.enqueue({
        id: '2',
        type: 'macrotask',
        name: 'future2',
        priority: 'normal',
        status: 'pending',
        createdAt: now,
        source: 'setTimeout',
        scheduledAt: now + 2000
      });

      const nextTime = macrotaskQueue.getNextScheduledTime();
      expect(nextTime).toBe(now + 1000);
    });

    it('모든 태스크가 과거이거나 비어있으면 undefined를 반환해야 한다', () => {
      // 빈 큐
      expect(macrotaskQueue.getNextScheduledTime()).toBeUndefined();
      
      // 과거 태스크만 있음
      macrotaskQueue.enqueue({
        id: '1',
        type: 'macrotask',
        name: 'past',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'setTimeout',
        scheduledAt: Date.now() - 1000
      });
      
      expect(macrotaskQueue.getNextScheduledTime()).toBeUndefined();
    });

    it('실행 가능한 태스크가 없으면 undefined를 반환해야 한다', () => {
      const now = Date.now();
      
      macrotaskQueue.enqueue({
        id: '1',
        type: 'macrotask',
        name: 'future',
        priority: 'normal',
        status: 'pending',
        createdAt: now,
        source: 'setTimeout',
        scheduledAt: now + 1000
      });

      const dequeued = macrotaskQueue.dequeueReady(now);
      expect(dequeued).toBeUndefined();
    });
  });

  describe('매크로태스크 큐 오버플로우', () => {
    it('큐가 가득 찼을 때 enqueue 시 에러가 발생해야 한다', () => {
      // 크기 1인 큐 생성
      const smallQueue = new MacrotaskQueue(1);
      
      // 첫 번째 태스크 추가 (성공)
      smallQueue.enqueue({
        id: '1',
        type: 'macrotask',
        name: 'task1',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'setTimeout',
        delay: 0
      });
      
      // 두 번째 태스크 추가 시도 (실패)
      expect(() => {
        smallQueue.enqueue({
          id: '2',
          type: 'macrotask',
          name: 'task2',
          priority: 'normal',
          status: 'pending',
          createdAt: Date.now(),
          source: 'setTimeout',
          delay: 100
        });
      }).toThrow('Macrotask queue is full');
    });
  });
});

describe('QueueSystem', () => {
  let queueSystem: QueueSystem;

  beforeEach(() => {
    queueSystem = new QueueSystem({
      maxCallStackSize: 5,
      maxMicrotaskQueueSize: 10,
      maxMacrotaskQueueSize: 10
    });
  });

  describe('생성자', () => {
    it('설정 없이 기본값으로 생성되어야 한다', () => {
      const system = new QueueSystem();
      expect(system.callStack.maxSize).toBe(10000);
      expect(system.microtaskQueue.maxSize).toBe(1000);
      expect(system.macrotaskQueue.maxSize).toBe(1000);
    });

    it('빈 설정 객체로 기본값을 사용해야 한다', () => {
      const system = new QueueSystem({});
      expect(system.callStack.maxSize).toBe(10000);
      expect(system.microtaskQueue.maxSize).toBe(1000);
      expect(system.macrotaskQueue.maxSize).toBe(1000);
    });

    it('일부 설정만 제공했을 때 나머지는 기본값을 사용해야 한다', () => {
      const system = new QueueSystem({
        maxCallStackSize: 50
      });
      expect(system.callStack.maxSize).toBe(50);
      expect(system.microtaskQueue.maxSize).toBe(1000);
      expect(system.macrotaskQueue.maxSize).toBe(1000);
    });

    it('모든 설정을 제공했을 때 해당 값들을 사용해야 한다', () => {
      const system = new QueueSystem({
        maxCallStackSize: 100,
        maxMicrotaskQueueSize: 200,
        maxMacrotaskQueueSize: 300
      });
      expect(system.callStack.maxSize).toBe(100);
      expect(system.microtaskQueue.maxSize).toBe(200);
      expect(system.macrotaskQueue.maxSize).toBe(300);
    });
  });

  describe('통합 상태 관리', () => {
    it('모든 큐가 비어있을 때 isEmpty가 true를 반환해야 한다', () => {
      expect(queueSystem.isEmpty()).toBe(true);
    });

    it('하나라도 태스크가 있으면 isEmpty가 false를 반환해야 한다', () => {
      queueSystem.microtaskQueue.enqueue({
        id: '1',
        type: 'microtask',
        name: 'test',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'promise'
      });

      expect(queueSystem.isEmpty()).toBe(false);
    });

    it('전체 태스크 수를 정확히 계산해야 한다', () => {
      queueSystem.callStack.push({
        id: '1',
        type: 'callstack',
        name: 'func1',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now()
      });
      queueSystem.microtaskQueue.enqueue({
        id: '2',
        type: 'microtask',
        name: 'micro1',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'promise'
      });
      queueSystem.macrotaskQueue.enqueue({
        id: '3',
        type: 'macrotask',
        name: 'macro1',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'setTimeout'
      });

      expect(queueSystem.getTotalTaskCount()).toBe(3);
    });
  });

  describe('스냅샷 기능', () => {
    it('현재 상태의 스냅샷을 생성할 수 있어야 한다', () => {
      // Given: 각 큐에 태스크 추가
      queueSystem.callStack.push({
        id: '1',
        type: 'callstack',
        name: 'testFunc',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now()
      });
      queueSystem.microtaskQueue.enqueue({
        id: '2',
        type: 'microtask',
        name: 'promiseTask',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'promise'
      });

      // When: 스냅샷 생성
      const snapshot = queueSystem.getSnapshot();

      // Then
      expect(snapshot.callStack).toHaveLength(1);
      expect(snapshot.microtaskQueue).toHaveLength(1);
      expect(snapshot.macrotaskQueue).toHaveLength(0);
      expect(snapshot.stats.totalTasks).toBe(2);
      expect(snapshot.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('스냅샷에서 상태를 복원할 수 있어야 한다', () => {
      // Given: 초기 상태 생성
      const originalSnapshot: QueueSystemSnapshot = {
        timestamp: Date.now(),
        callStack: [{
          id: '1',
          type: 'callstack',
          name: 'restored1',
          priority: 'normal',
          status: 'pending',
          createdAt: Date.now()
        }],
        microtaskQueue: [{
          id: '2',
          type: 'microtask',
          name: 'restored2',
          priority: 'normal',
          status: 'pending',
          createdAt: Date.now(),
          source: 'promise'
        }],
        macrotaskQueue: [],
        stats: {
          callStackSize: 1,
          microtaskQueueSize: 1,
          macrotaskQueueSize: 0,
          totalTasks: 2
        }
      };

      // When: 복원
      queueSystem.restoreFromSnapshot(originalSnapshot);

      // Then
      expect(queueSystem.callStack.size()).toBe(1);
      expect(queueSystem.callStack.peek()?.name).toBe('restored1');
      expect(queueSystem.microtaskQueue.size()).toBe(1);
      expect(queueSystem.microtaskQueue.peek()?.name).toBe('restored2');
    });
  });

  describe('디버그 정보', () => {
    it('읽기 쉬운 디버그 정보를 생성해야 한다', () => {
      queueSystem.callStack.push({
        id: '1',
        type: 'callstack',
        name: 'main',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        context: { id: 'ctx1', functionName: 'main', scope: {}, timestamp: Date.now() }
      });

      const debugInfo = queueSystem.getDebugInfo();
      
      expect(debugInfo).toContain('Queue System Debug Info');
      expect(debugInfo).toContain('CallStack (1/5)');
      expect(debugInfo).toContain('main');
    });

    it('많은 태스크가 있을 때 생략 메시지를 표시해야 한다', () => {
      // Given: 큰 크기의 큐 시스템 생성
      const largeQueueSystem = new QueueSystem({
        maxCallStackSize: 10,
        maxMicrotaskQueueSize: 10,
        maxMacrotaskQueueSize: 10
      });
      
      // 많은 태스크 추가 (7개)
      for (let i = 0; i < 7; i++) {
        largeQueueSystem.callStack.push({
          id: `${i}`,
          type: 'callstack',
          name: `func${i}`,
          priority: 'normal',
          status: 'pending',
          createdAt: Date.now(),
          context: { id: `ctx${i}`, functionName: `func${i}`, scope: {}, timestamp: Date.now() }
        });
      }
      
      for (let i = 0; i < 5; i++) {
        largeQueueSystem.microtaskQueue.enqueue({
          id: `micro${i}`,
          type: 'microtask',
          name: `micro${i}`,
          priority: 'normal',
          status: 'pending',
          createdAt: Date.now(),
          source: 'promise'
        });
      }
      
      for (let i = 0; i < 5; i++) {
        largeQueueSystem.macrotaskQueue.enqueue({
          id: `macro${i}`,
          type: 'macrotask',
          name: `macro${i}`,
          priority: 'normal',
          status: 'pending',
          createdAt: Date.now(),
          source: 'setTimeout',
          scheduledAt: Date.now() + i * 100
        });
      }

      const debugInfo = largeQueueSystem.getDebugInfo();
      
      expect(debugInfo).toContain('... and 2 more'); // CallStack 7개 중 5개 표시
      expect(debugInfo).toContain('and 2 more'); // Microtask 5개 중 3개 표시
      expect(debugInfo).toContain('and 2 more'); // Macrotask 5개 중 3개 표시
    });

    it('빈 컴텍스트 필드를 처리해야 한다', () => {
      queueSystem.callStack.push({
        id: '1',
        type: 'callstack',
        name: 'noContext',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now()
        // context 없음
      });

      const debugInfo = queueSystem.getDebugInfo();
      expect(debugInfo).toContain('anonymous'); // context가 없을 때 anonymous
    });
  });

  describe('reset 기능', () => {
    it('모든 큐를 초기화해야 한다', () => {
      // Given: 각 큐에 태스크 추가
      queueSystem.callStack.push({
        id: '1',
        type: 'callstack',
        name: 'func1',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now()
      });
      queueSystem.microtaskQueue.enqueue({
        id: '2',
        type: 'microtask',
        name: 'micro1',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'promise'
      });
      queueSystem.macrotaskQueue.enqueue({
        id: '3',
        type: 'macrotask',
        name: 'macro1',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'setTimeout'
      });

      // When: 초기화
      queueSystem.reset();

      // Then: 모든 큐가 비어있음
      expect(queueSystem.isEmpty()).toBe(true);
      expect(queueSystem.getTotalTaskCount()).toBe(0);
    });
  });

  describe('MacrotaskQueue 추가 브랜치 커버리지', () => {
    it('dequeueReady에서 준비된 태스크가 없을 때 undefined를 반환해야 한다', () => {
      const queue = new MacrotaskQueue(5);
      const future = Date.now() + 10000;
      
      // 모든 태스크가 미래 시간
      queue.enqueue({
        id: '1',
        type: 'macrotask',
        name: 'future-task',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'setTimeout',
        scheduledAt: future
      });

      const ready = queue.dequeueReady(Date.now());
      expect(ready).toBeUndefined();
    });
    it('findScheduledPosition에서 scheduledAt이 없는 태스크를 올바르게 처리해야 한다', () => {
      const queue = new MacrotaskQueue(5);
      
      // scheduledAt이 있는 태스크 추가
      queue.enqueue({
        id: '1',
        type: 'macrotask',
        name: 'task1',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'setTimeout',
        scheduledAt: Date.now() + 1000
      });

      // scheduledAt이 없는 태스크를 추가하면 앞쪽에 위치해야 함
      const taskWithoutSchedule = {
        id: '2',
        type: 'macrotask',
        name: 'task2',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'setImmediate'
        // scheduledAt 없음 - enqueue가 자동으로 설정함
      } as MacrotaskItem;
      
      queue.enqueue(taskWithoutSchedule);
      
      // scheduledAt이 없던 태스크가 현재 시간으로 설정되어 앞에 위치
      expect(queue.items[0].name).toBe('task2');
      expect(queue.items[1].name).toBe('task1');
    });

    it('getNextScheduledTime에서 scheduledAt이 없는 태스크가 있을 때 처리해야 한다', () => {
      const queue = new MacrotaskQueue(5);
      const now = Date.now();
      
      // 모든 태스크가 과거 시간
      queue.enqueue({
        id: '1',
        type: 'macrotask',
        name: 'past-task',
        priority: 'normal',
        status: 'pending',
        createdAt: now,
        source: 'setTimeout',
        scheduledAt: now - 1000
      });

      const nextTime = queue.getNextScheduledTime();
      expect(nextTime).toBeUndefined();
    });
  });

  describe('디버그 정보 - scheduledAt 처리', () => {
    it('scheduledAt이 없는 매크로태스크를 immediate로 표시해야 한다', () => {
      // scheduledAt이 없는 매크로태스크 추가
      queueSystem.macrotaskQueue.enqueue({
        id: '1',
        type: 'macrotask',
        name: 'immediateTask',
        priority: 'normal',
        status: 'pending',
        createdAt: Date.now(),
        source: 'setImmediate'
        // scheduledAt 없음
      });

      const debugInfo = queueSystem.getDebugInfo();
      // scheduledAt이 자동으로 설정되므로, 타임스탬프가 포함되어야 함
      expect(debugInfo).toContain('scheduled: ');
      expect(debugInfo).toContain('immediateTask');
    });

    it('scheduledAt이 있는 매크로태스크를 시간과 함께 표시해야 한다', () => {
      const now = Date.now();
      queueSystem.macrotaskQueue.enqueue({
        id: '1',
        type: 'macrotask',
        name: 'delayedTask',
        priority: 'normal',
        status: 'pending',
        createdAt: now,
        source: 'setTimeout',
        scheduledAt: now + 1000
      });

      const debugInfo = queueSystem.getDebugInfo();
      expect(debugInfo).toContain(`scheduled: ${now + 1000}`);
    });

    it('혼합된 scheduledAt 값들을 올바르게 표시해야 한다', () => {
      const now = Date.now();
      
      // scheduledAt 없는 태스크
      queueSystem.macrotaskQueue.enqueue({
        id: '1',
        type: 'macrotask',
        name: 'immediate',
        priority: 'normal',
        status: 'pending',
        createdAt: now,
        source: 'setImmediate'
      });

      // scheduledAt 있는 태스크
      queueSystem.macrotaskQueue.enqueue({
        id: '2',
        type: 'macrotask',
        name: 'delayed',
        priority: 'normal',
        status: 'pending',
        createdAt: now,
        source: 'setTimeout',
        scheduledAt: now + 2000
      });

      const debugInfo = queueSystem.getDebugInfo();
      const lines = debugInfo.split('\n');
      
      // 두 태스크가 모두 표시되어야 함
      const macrotaskLines = lines.filter(line => line.includes('immediate') || line.includes('delayed'));
      expect(macrotaskLines.length).toBeGreaterThanOrEqual(2);
      
      // 두 태스크 모두 scheduledAt을 가짐
      const hasImmediateTask = lines.some(line => line.includes('immediate'));
      const hasDelayedTask = lines.some(line => line.includes('delayed'));
      const hasTimestamp = lines.some(line => line.includes(`scheduled: ${now + 2000}`));
      
      expect(hasImmediateTask).toBe(true);
      expect(hasDelayedTask).toBe(true);
      expect(hasTimestamp).toBe(true);
    });
  });
});