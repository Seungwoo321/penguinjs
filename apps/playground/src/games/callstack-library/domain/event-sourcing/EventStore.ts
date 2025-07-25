/**
 * EventStore - Event Sourcing을 위한 이벤트 저장소
 * 
 * 모든 상태 변화를 이벤트로 기록하고 재생할 수 있는 저장소
 * 시간 여행, 디버깅, 상태 복원 등을 지원
 */

// 기본 이벤트 인터페이스
export interface DomainEvent {
  readonly id: string;
  readonly type: string;
  readonly aggregateId: string;
  readonly aggregateType: string;
  readonly version: number;
  readonly timestamp: number;
  readonly payload: Record<string, any>;
  readonly metadata?: EventMetadata;
}

// 이벤트 메타데이터
export interface EventMetadata {
  readonly userId?: string;
  readonly sessionId: string;
  readonly causationId?: string; // 이 이벤트를 발생시킨 명령의 ID
  readonly correlationId?: string; // 연관된 이벤트들의 그룹 ID
  readonly source: string; // 이벤트 발생 소스
  readonly userAgent?: string;
  readonly ipAddress?: string;
}

// 이벤트 스트림
export interface EventStream {
  readonly streamId: string;
  readonly version: number;
  readonly events: ReadonlyArray<DomainEvent>;
}

// 이벤트 스토어 인터페이스
export interface IEventStore {
  // 이벤트 저장
  appendEvents(
    streamId: string,
    expectedVersion: number,
    events: DomainEvent[]
  ): Promise<void>;

  // 이벤트 조회
  getEvents(
    streamId: string,
    fromVersion?: number,
    toVersion?: number
  ): Promise<DomainEvent[]>;

  // 스트림 존재 여부 확인
  streamExists(streamId: string): Promise<boolean>;

  // 스트림 정보 조회
  getStreamInfo(streamId: string): Promise<EventStream | null>;

  // 모든 이벤트 조회 (특정 타입)
  getEventsByType(eventType: string): Promise<DomainEvent[]>;

  // 시점 기준 조회
  getEventsFrom(timestamp: number): Promise<DomainEvent[]>;
  getEventsTo(timestamp: number): Promise<DomainEvent[]>;
}

// 메모리 기반 이벤트 스토어 구현
export class InMemoryEventStore implements IEventStore {
  private streams = new Map<string, EventStream>();
  private allEvents: DomainEvent[] = [];
  private eventListeners = new Map<string, Array<(event: DomainEvent) => void>>();

  async appendEvents(
    streamId: string,
    expectedVersion: number,
    events: DomainEvent[]
  ): Promise<void> {
    if (events.length === 0) return;

    const currentStream = this.streams.get(streamId);
    const currentVersion = currentStream?.version ?? 0;

    // 낙관적 동시성 제어
    if (expectedVersion !== currentVersion) {
      throw new Error(
        `Concurrency conflict: expected version ${expectedVersion}, but current version is ${currentVersion}`
      );
    }

    // 이벤트 버전 검증
    const firstEventVersion = currentVersion + 1;
    events.forEach((event, index) => {
      if (event.version !== firstEventVersion + index) {
        throw new Error(
          `Invalid event version: expected ${firstEventVersion + index}, got ${event.version}`
        );
      }
    });

    // 스트림 업데이트
    const newStream: EventStream = {
      streamId,
      version: currentVersion + events.length,
      events: [...(currentStream?.events ?? []), ...events]
    };

    this.streams.set(streamId, newStream);
    this.allEvents.push(...events);

    // 이벤트 리스너에게 알림
    events.forEach(event => {
      this.notifyListeners(event.type, event);
      this.notifyListeners('*', event); // 모든 이벤트 리스너
    });
  }

  async getEvents(
    streamId: string,
    fromVersion?: number,
    toVersion?: number
  ): Promise<DomainEvent[]> {
    const stream = this.streams.get(streamId);
    if (!stream) return [];

    let events = stream.events;

    if (fromVersion !== undefined) {
      events = events.filter(e => e.version >= fromVersion);
    }

    if (toVersion !== undefined) {
      events = events.filter(e => e.version <= toVersion);
    }

    return [...events];
  }

  async streamExists(streamId: string): Promise<boolean> {
    return this.streams.has(streamId);
  }

  async getStreamInfo(streamId: string): Promise<EventStream | null> {
    const stream = this.streams.get(streamId);
    return stream ? { ...stream } : null;
  }

  async getEventsByType(eventType: string): Promise<DomainEvent[]> {
    return this.allEvents.filter(e => e.type === eventType);
  }

  async getEventsFrom(timestamp: number): Promise<DomainEvent[]> {
    return this.allEvents.filter(e => e.timestamp >= timestamp);
  }

  async getEventsTo(timestamp: number): Promise<DomainEvent[]> {
    return this.allEvents.filter(e => e.timestamp <= timestamp);
  }

  // 이벤트 리스너 등록
  subscribe(eventType: string, listener: (event: DomainEvent) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }

    this.eventListeners.get(eventType)!.push(listener);

    // unsubscribe 함수 반환
    return () => {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // 리스너에게 이벤트 알림
  private notifyListeners(eventType: string, event: DomainEvent): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  // 디버그용 메서드들
  getAllEvents(): ReadonlyArray<DomainEvent> {
    return [...this.allEvents];
  }

  getAllStreams(): ReadonlyArray<EventStream> {
    return Array.from(this.streams.values());
  }

  getEventCount(): number {
    return this.allEvents.length;
  }

  getStreamCount(): number {
    return this.streams.size;
  }

  // 스토어 초기화
  clear(): void {
    this.streams.clear();
    this.allEvents = [];
    this.eventListeners.clear();
  }

  // 스냅샷 생성 (전체 상태)
  createSnapshot(): EventStoreSnapshot {
    return {
      streams: Array.from(this.streams.entries()),
      allEvents: [...this.allEvents],
      timestamp: Date.now()
    };
  }

  // 스냅샷에서 복원
  restoreFromSnapshot(snapshot: EventStoreSnapshot): void {
    this.clear();
    this.streams = new Map(snapshot.streams);
    this.allEvents = [...snapshot.allEvents];
  }
}

// 스냅샷 타입
interface EventStoreSnapshot {
  streams: Array<[string, EventStream]>;
  allEvents: DomainEvent[];
  timestamp: number;
}

// 이벤트 빌더 - 이벤트 생성을 위한 유틸리티
export class EventBuilder {
  private event: Partial<DomainEvent> = {};

  static create(): EventBuilder {
    return new EventBuilder();
  }

  withId(id: string): EventBuilder {
    this.event.id = id;
    return this;
  }

  withType(type: string): EventBuilder {
    this.event.type = type;
    return this;
  }

  withAggregateId(aggregateId: string): EventBuilder {
    this.event.aggregateId = aggregateId;
    return this;
  }

  withAggregateType(aggregateType: string): EventBuilder {
    this.event.aggregateType = aggregateType;
    return this;
  }

  withVersion(version: number): EventBuilder {
    this.event.version = version;
    return this;
  }

  withPayload(payload: Record<string, any>): EventBuilder {
    this.event.payload = payload;
    return this;
  }

  withMetadata(metadata: EventMetadata): EventBuilder {
    this.event.metadata = metadata;
    return this;
  }

  withTimestamp(timestamp?: number): EventBuilder {
    this.event.timestamp = timestamp ?? Date.now();
    return this;
  }

  build(): DomainEvent {
    // 필수 필드 검증
    if (!this.event.id) {
      this.event.id = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    if (!this.event.timestamp) {
      this.event.timestamp = Date.now();
    }

    const requiredFields = ['type', 'aggregateId', 'aggregateType', 'version', 'payload'];
    for (const field of requiredFields) {
      if (!(field in this.event)) {
        throw new Error(`Required field '${field}' is missing`);
      }
    }

    return this.event as DomainEvent;
  }
}

// 이벤트 생성 헬퍼 함수
export function createEvent(
  type: string,
  aggregateId: string,
  aggregateType: string,
  version: number,
  payload: Record<string, any>,
  metadata?: Partial<EventMetadata>
): DomainEvent {
  return EventBuilder.create()
    .withType(type)
    .withAggregateId(aggregateId)
    .withAggregateType(aggregateType)
    .withVersion(version)
    .withPayload(payload)
    .withMetadata({
      sessionId: 'default',
      source: 'system',
      ...metadata
    } as EventMetadata)
    .withTimestamp()
    .build();
}