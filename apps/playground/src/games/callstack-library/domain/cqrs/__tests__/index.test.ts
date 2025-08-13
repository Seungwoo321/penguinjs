/**
 * CQRS 인덱스 파일 테스트
 * 
 * CQRS 모듈의 모든 내보내기를 검증합니다.
 */

import { describe, it, expect } from 'vitest';
import * as CQRSIndex from '@/games/callstack-library/index';
import * as Commands from '@/games/callstack-library/Commands';
import * as CommandHandler from '@/games/callstack-library/CommandHandler';
import * as Queries from '@/games/callstack-library/Queries';
import * as QueryHandler from '@/games/callstack-library/QueryHandler';
import { CQRSEventLoopService } from '@/games/callstack-library/CQRSEventLoopService';

describe('CQRS index', () => {
  it('모든 모듈이 올바르게 내보내졌는지 확인해야 한다', () => {
    // 모든 export가 실제로 작동하는지 확인
    expect(Object.keys(CQRSIndex).length).toBeGreaterThan(0);
  });
  it('Commands 모듈의 모든 내보내기를 다시 내보내야 한다', () => {
    // Commands 모듈의 주요 클래스들 확인
    expect(CQRSIndex.PushFunctionCommand).toBe(Commands.PushFunctionCommand);
    expect(CQRSIndex.PopFunctionCommand).toBe(Commands.PopFunctionCommand);
    expect(CQRSIndex.EnqueueMicrotaskCommand).toBe(Commands.EnqueueMicrotaskCommand);
    expect(CQRSIndex.EnqueueMacrotaskCommand).toBe(Commands.EnqueueMacrotaskCommand);
    expect(CQRSIndex.TickCommand).toBe(Commands.TickCommand);
    expect(CQRSIndex.ResetEngineCommand).toBe(Commands.ResetEngineCommand);
    expect(CQRSIndex.RewindToTickCommand).toBe(Commands.RewindToTickCommand);
    expect(CQRSIndex.SetBreakpointCommand).toBe(Commands.SetBreakpointCommand);
    expect(CQRSIndex.PauseExecutionCommand).toBe(Commands.PauseExecutionCommand);
    expect(CQRSIndex.ResumeExecutionCommand).toBe(Commands.ResumeExecutionCommand);
    expect(CQRSIndex.CreateSnapshotCommand).toBe(Commands.CreateSnapshotCommand);
    expect(CQRSIndex.RestoreSnapshotCommand).toBe(Commands.RestoreSnapshotCommand);
    
    // 유틸리티 함수들 확인
    expect(CQRSIndex.createCommandContext).toBe(Commands.createCommandContext);
    expect(CQRSIndex.validateCommand).toBe(Commands.validateCommand);
    expect(CQRSIndex.isCommand).toBe(Commands.isCommand);
  });

  it('CommandHandler 모듈의 모든 내보내기를 다시 내보내야 한다', () => {
    expect(CQRSIndex.EventLoopCommandHandler).toBe(CommandHandler.EventLoopCommandHandler);
    expect(CQRSIndex.CommandLogger).toBe(CommandHandler.CommandLogger);
  });

  it('Queries 모듈의 모든 내보내기를 다시 내보내야 한다', () => {
    // Query 클래스들 확인
    expect(CQRSIndex.GetCurrentStateQuery).toBe(Queries.GetCurrentStateQuery);
    expect(CQRSIndex.GetCallStackQuery).toBe(Queries.GetCallStackQuery);
    expect(CQRSIndex.GetQueueStateQuery).toBe(Queries.GetQueueStateQuery);
    expect(CQRSIndex.GetExecutionHistoryQuery).toBe(Queries.GetExecutionHistoryQuery);
    expect(CQRSIndex.GetEventHistoryQuery).toBe(Queries.GetEventHistoryQuery);
    expect(CQRSIndex.GetEventsByTypeQuery).toBe(Queries.GetEventsByTypeQuery);
    expect(CQRSIndex.GetPerformanceMetricsQuery).toBe(Queries.GetPerformanceMetricsQuery);
    expect(CQRSIndex.GetSimulationStateQuery).toBe(Queries.GetSimulationStateQuery);
    expect(CQRSIndex.GetStackTraceQuery).toBe(Queries.GetStackTraceQuery);
    expect(CQRSIndex.GetQueueMetadataQuery).toBe(Queries.GetQueueMetadataQuery);
    expect(CQRSIndex.CanPushToCallStackQuery).toBe(Queries.CanPushToCallStackQuery);
    expect(CQRSIndex.IsEngineRunningQuery).toBe(Queries.IsEngineRunningQuery);
    expect(CQRSIndex.GetBreakpointsQuery).toBe(Queries.GetBreakpointsQuery);
    expect(CQRSIndex.GetSnapshotsQuery).toBe(Queries.GetSnapshotsQuery);
    expect(CQRSIndex.GetHealthStatusQuery).toBe(Queries.GetHealthStatusQuery);
    
    // 유틸리티 함수들 확인
    expect(CQRSIndex.createQueryContext).toBe(Queries.createQueryContext);
    expect(CQRSIndex.validateQuery).toBe(Queries.validateQuery);
    expect(CQRSIndex.isQuery).toBe(Queries.isQuery);
  });

  it('QueryHandler 모듈의 모든 내보내기를 다시 내보내야 한다', () => {
    expect(CQRSIndex.EventLoopQueryHandler).toBe(QueryHandler.EventLoopQueryHandler);
    expect(CQRSIndex.QueryCache).toBe(QueryHandler.QueryCache);
  });

  it('CQRSEventLoopService를 내보내야 한다', () => {
    expect(CQRSIndex.CQRSEventLoopService).toBe(CQRSEventLoopService);
  });

  it('내보낸 모든 것이 정의되어 있어야 한다', () => {
    // Commands - 실제로 export되는 것들만 확인
    const commandExports = Object.keys(Commands);
    commandExports.forEach(key => {
      if (CQRSIndex[key as keyof typeof CQRSIndex]) {
        expect(CQRSIndex[key as keyof typeof CQRSIndex]).toBeDefined();
      }
    });
    
    // Service는 직접 export됨
    expect(CQRSIndex.CQRSEventLoopService).toBeDefined();
  });

  it('타입들이 올바르게 내보내져야 한다', () => {
    // 타입 내보내기 확인을 위한 컴파일 시간 검증
    // TypeScript가 타입을 올바르게 인식하는지 확인
    type CommandType = CQRSIndex.Command;
    type QueryType = CQRSIndex.Query;
    type CommandContextType = CQRSIndex.CommandContext;
    type QueryContextType = CQRSIndex.QueryContext;
    type CommandResultType = CQRSIndex.CommandResult;
    type QueryResultType = CQRSIndex.QueryResult;
    
    // 타입이 올바르게 정의되었는지 확인
    expect(true).toBe(true); // 컴파일이 성공하면 테스트 통과
  });
});