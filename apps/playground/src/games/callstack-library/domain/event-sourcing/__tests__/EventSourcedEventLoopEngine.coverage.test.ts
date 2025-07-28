/**
 * EventSourcedEventLoopEngine 추가 커버리지 테스트
 * 
 * 누락된 catch 블록과 에러 처리를 위한 테스트
 */

import {
  EventSourcedEventLoopEngine,
  EventLoopEventTypes
} from '../EventSourcedEventLoopEngine';
import { InMemoryEventStore } from '../EventStore';
import { EventLoopConfig } from '../../event-loop/types';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('EventSourcedEventLoopEngine 에러 처리 커버리지', () => {
  let engine: EventSourcedEventLoopEngine;
  let eventStore: InMemoryEventStore;
  let config: EventLoopConfig;

  beforeEach(() => {
    config = {
      maxCallStackSize: 10,
      maxMicrotaskQueueSize: 100,
      maxMacrotaskQueueSize: 100,
      executionTimeout: 5000,
      enableLogging: false
    };
    eventStore = new InMemoryEventStore();
    engine = new EventSourcedEventLoopEngine(config, eventStore, 'test-engine');
  });

  describe('popFromCallStack 에러 처리', () => {
    it('popFromCallStack 중 recordEvent가 실패해도 에러를 반환해야 한다', async () => {
      // 콜스택에 함수 추가
      await engine.pushToCallStack({
        type: 'callstack',
        name: 'testFunction',
        priority: 'normal'
      });

      // recordEvent를 spy하여 특정 호출에서만 에러 발생시킴
      const recordEventSpy = vi.spyOn(engine as any, 'recordEvent');
      recordEventSpy.mockRejectedValueOnce(new Error('Record error'));

      const result = await engine.popFromCallStack();

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Record error');

      // spy 복원
      recordEventSpy.mockRestore();
    });
  });

  describe('enqueueMicrotask 에러 처리', () => {
    it('enqueueMicrotask 중 recordEvent가 실패해도 에러를 반환해야 한다', async () => {
      // recordEvent를 spy하여 특정 호출에서만 에러 발생시킴
      const recordEventSpy = vi.spyOn(engine as any, 'recordEvent');
      recordEventSpy.mockRejectedValueOnce(new Error('Record error'));

      const result = await engine.enqueueMicrotask({
        type: 'microtask',
        name: 'testMicrotask',
        priority: 'normal',
        source: 'user'
      });

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Record error');

      // spy 복원
      recordEventSpy.mockRestore();
    });
  });

  describe('pushToCallStack 동시성 충돌 처리', () => {
    it('동시성 충돌 시 예외를 다시 던져야 한다', async () => {
      // recordEvent를 spy하여 동시성 충돌 에러 발생시킴
      const recordEventSpy = vi.spyOn(engine as any, 'recordEvent');
      recordEventSpy.mockRejectedValueOnce(new Error('Concurrency conflict detected'));

      await expect(engine.pushToCallStack({
        type: 'callstack',
        name: 'testFunction',
        priority: 'normal'
      })).rejects.toThrow('Concurrency conflict');

      // spy 복원
      recordEventSpy.mockRestore();
    });

    it('동시성 충돌이 아닌 일반 에러 시 에러 결과를 반환해야 한다', async () => {
      // recordEvent가 첫 번째 호출에서 일반 에러를 던지도록 모킹
      const recordEventSpy = vi.spyOn(engine as any, 'recordEvent');
      recordEventSpy.mockRejectedValueOnce(new Error('General error'));
      
      const frame = { type: 'callstack', name: 'test', priority: 'normal' } as any;
      
      // pushToCallStack 호출하면 에러가 발생하지만 throw하지 않고 결과 반환
      const result = await engine.pushToCallStack(frame);
      
      // 에러 결과가 반환되어야 함 (lines 295-301 커버)
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('General error');
      expect(result.stateChange).toEqual({});
      expect(result.sideEffects).toEqual([]);
      
      // recordEvent가 두 번 호출되어야 함 (첫 번째는 실패, 두 번째는 EXECUTION_ERROR 이벤트)
      expect(recordEventSpy).toHaveBeenCalledTimes(2);
      expect(recordEventSpy).toHaveBeenCalledWith(EventLoopEventTypes.EXECUTION_ERROR, {
        error: 'General error',
        operation: 'pushToCallStack',
        context: frame
      });
      
      recordEventSpy.mockRestore();
    });
  });
});