/**
 * Event Sourcing Infrastructure - Shared Layer
 * 
 * Feature-Sliced Design에서 shared 레이어에 위치하는
 * 재사용 가능한 Event Sourcing 인프라스트럭처
 */

export * from '@/games/callstack-library/domain/event-sourcing/EventStore';
export * from '@/games/callstack-library/domain/event-sourcing/EventSourcedEventLoopEngine';