/**
 * CommandHandler 추가 커버리지 테스트
 * 
 * 누락된 브랜치와 에러 처리를 위한 테스트
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventLoopCommandHandler } from '../CommandHandler';
import { 
  Command,
  CommandContext
} from '../Commands';
import { EventSourcedEventLoopEngine } from '../../event-sourcing/EventSourcedEventLoopEngine';
import { InMemoryEventStore } from '../../event-sourcing/EventStore';
import { EventLoopConfig } from '../../event-loop/types';

describe('CommandHandler 커버리지 개선', () => {
  let engine: EventSourcedEventLoopEngine;
  let commandHandler: EventLoopCommandHandler;
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
    engine = new EventSourcedEventLoopEngine(config, eventStore, 'test-session');
    commandHandler = new EventLoopCommandHandler(engine, config);
  });

  describe('SetBreakpoint 명령 처리', () => {
    it('소문자 SetBreakpoint 타입이 처리되어야 한다 (line 214 커버)', async () => {
      const command: Command = {
        commandId: 'test-cmd-1',
        timestamp: Date.now(),
        type: 'SetBreakpoint',
        payload: {
          tickNumber: 5,
          condition: 'test'
        }
      };
      
      const context: CommandContext = {
        sessionId: 'test-session',
        source: 'test',
        timestamp: Date.now(),
        timeout: 5000
      };
      const result = await commandHandler.handle(command, context);
      
      expect(result.success).toBe(true);
    });

    it('대문자 SET_BREAKPOINT 타입으로도 처리되어야 한다', async () => {
      const command: Command = {
        commandId: 'test-cmd-1b',
        timestamp: Date.now(),
        type: 'SET_BREAKPOINT' as any,
        payload: {
          tickNumber: 5,
          condition: 'test'
        }
      };
      
      const context: CommandContext = {
        sessionId: 'test-session',
        source: 'test',
        timestamp: Date.now(),
        timeout: 5000
      };
      const result = await commandHandler.handle(command, context);
      
      expect(result.success).toBe(true);
    });
  });

  describe('REWIND_TO_TICK 명령 처리', () => {
    it('대문자 REWIND_TO_TICK 타입으로도 처리되어야 한다', async () => {
      // 먼저 몇 번의 tick을 실행하여 대상 tick이 존재하도록 함
      await engine.tick();
      await engine.tick();
      await engine.tick();
      
      const command: Command = {
        commandId: 'test-cmd-2',
        timestamp: Date.now(),
        type: 'REWIND_TO_TICK' as any,
        payload: {
          targetTick: 2
        }
      };
      
      const context: CommandContext = {
        sessionId: 'test-session',
        source: 'test',
        timestamp: Date.now(),
        timeout: 5000
      };
      const result = await commandHandler.handle(command, context);
      
      expect(result.success).toBe(true);
    });
  });

  describe('DequeueMicrotask 명령 처리', () => {
    it('DequeueMicrotask 명령이 성공적으로 처리되어야 한다', async () => {
      const command: Command = {
        commandId: 'test-cmd-3',
        timestamp: Date.now(),
        type: 'DequeueMicrotask',
        payload: {
          taskId: 'task-123'
        }
      };
      
      const context: CommandContext = {
        sessionId: 'test-session',
        source: 'test',
        timestamp: Date.now(),
        timeout: 5000
      };
      const result = await commandHandler.handle(command, context);
      
      expect(result.success).toBe(true);
      // DequeueMicrotask는 직접 동작하지 않음 (tick 내에서 처리됨)
    });
  });

  describe('CancelMacrotask 명령 처리', () => {
    it('CancelMacrotask 명령이 성공적으로 처리되어야 한다', async () => {
      const command: Command = {
        commandId: 'test-cmd-4',
        timestamp: Date.now(),
        type: 'CancelMacrotask',
        payload: {
          taskId: 'macro-123'
        }
      };
      
      const context: CommandContext = {
        sessionId: 'test-session',
        source: 'test',
        timestamp: Date.now(),
        timeout: 5000
      };
      const result = await commandHandler.handle(command, context);
      
      expect(result.success).toBe(true);
      // CancelMacrotask는 현재 구현되지 않음 (항상 성공 반환)
    });
  });

  describe('엔진 메서드 호출 에러', () => {
    it('SetBreakpoint 처리 중 에러가 발생해도 적절히 처리되어야 한다', async () => {
      const command: Command = {
        commandId: 'test-cmd-5',
        timestamp: Date.now(),
        type: 'SetBreakpoint',
        payload: {
          tickNumber: 5,
          condition: 'test'
        }
      };
      
      // handleSetBreakpoint이 에러를 던지도록 모킹
      commandHandler['handleSetBreakpoint'] = vi.fn().mockRejectedValue(new Error('Breakpoint error'));
      
      const context: CommandContext = {
        sessionId: 'test-session',
        source: 'test',
        timestamp: Date.now(),
        timeout: 5000
      };
      
      const result = await commandHandler.handle(command, context);
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Breakpoint error');
    });
  });
});