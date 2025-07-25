/**
 * DevTools Panel
 * 
 * Phase 4: 확장성 확보 - DevTools 및 관찰 가능성 강화
 * 개발자 도구 패널과 디버깅 인터페이스
 */

import React, { 
  memo, 
  useState, 
  useEffect, 
  useCallback,
  useMemo,
  useRef
} from 'react';
import { cn } from '@penguinjs/ui';

import { CQRSEventLoopService } from '../cqrs';
import { WorkerManager } from '../workers';
import { PluginRegistry } from '../plugin-system';
import { VirtualizedEventList } from '../virtualization';

// DevTools 패널 타입
export type DevToolsPanel = 
  | 'events' 
  | 'state' 
  | 'performance' 
  | 'network' 
  | 'plugins' 
  | 'workers' 
  | 'errors'
  | 'timeline';

// DevTools 설정
export interface DevToolsConfig {
  defaultPanel: DevToolsPanel;
  enabledPanels: DevToolsPanel[];
  maxEventHistory: number;
  refreshInterval: number;
  enableAutoRefresh: boolean;
}

// DevTools 데이터
export interface DevToolsData {
  events: any[];
  currentState: any;
  performanceMetrics: any;
  errors: Error[];
  plugins: any[];
  workerStatus: any;
  timeline: any[];
}

// 메인 DevTools 컴포넌트
export const DevToolsPanel: React.FC<{
  cqrsService?: CQRSEventLoopService;
  workerManager?: WorkerManager;
  pluginRegistry?: PluginRegistry;
  config?: Partial<DevToolsConfig>;
  className?: string;
}> = memo(({ 
  cqrsService, 
  workerManager, 
  pluginRegistry,
  config,
  className 
}) => {
  const defaultConfig: DevToolsConfig = {
    defaultPanel: 'events',
    enabledPanels: ['events', 'state', 'performance', 'plugins', 'workers', 'errors'],
    maxEventHistory: 1000,
    refreshInterval: 1000,
    enableAutoRefresh: true
  };

  const mergedConfig = { ...defaultConfig, ...config };
  const [activePanel, setActivePanel] = useState<DevToolsPanel>(mergedConfig.defaultPanel);
  const [data, setData] = useState<DevToolsData>({
    events: [],
    currentState: null,
    performanceMetrics: null,
    errors: [],
    plugins: [],
    workerStatus: null,
    timeline: []
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshIntervalRef = useRef<number>();

  // 데이터 새로고침
  const refreshData = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      const newData: Partial<DevToolsData> = {};

      // CQRS 서비스 데이터
      if (cqrsService) {
        try {
          const [events, state, metrics] = await Promise.all([
            cqrsService.getEvents(),
            cqrsService.getCurrentState(),
            cqrsService.getPerformanceMetrics()
          ]);

          newData.events = events.data || [];
          newData.currentState = state.data;
          newData.performanceMetrics = metrics.data;
        } catch (error) {
          console.warn('Failed to fetch CQRS data:', error);
        }
      }

      // Worker 상태
      if (workerManager) {
        try {
          newData.workerStatus = await workerManager.getWorkerState();
        } catch (error) {
          console.warn('Failed to fetch worker status:', error);
        }
      }

      // 플러그인 정보
      if (pluginRegistry) {
        try {
          newData.plugins = pluginRegistry.getPlugins();
        } catch (error) {
          console.warn('Failed to fetch plugin info:', error);
        }
      }

      setData(prev => ({ ...prev, ...newData }));

    } catch (error) {
      console.error('DevTools refresh failed:', error);
      setData(prev => ({
        ...prev,
        errors: [...prev.errors, error as Error].slice(-50) // 최근 50개 에러만 보관
      }));
    } finally {
      setIsRefreshing(false);
    }
  }, [cqrsService, workerManager, pluginRegistry, isRefreshing]);

  // 자동 새로고침 설정
  useEffect(() => {
    if (mergedConfig.enableAutoRefresh) {
      refreshIntervalRef.current = window.setInterval(
        refreshData, 
        mergedConfig.refreshInterval
      );

      // 초기 로드
      refreshData();
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [refreshData, mergedConfig.enableAutoRefresh, mergedConfig.refreshInterval]);

  // 패널 렌더링
  const renderActivePanel = () => {
    switch (activePanel) {
      case 'events':
        return <EventsPanel events={data.events} />;
      case 'state':
        return <StatePanel state={data.currentState} />;
      case 'performance':
        return <PerformancePanel metrics={data.performanceMetrics} />;
      case 'plugins':
        return <PluginsPanel plugins={data.plugins} />;
      case 'workers':
        return <WorkersPanel status={data.workerStatus} />;
      case 'errors':
        return <ErrorsPanel errors={data.errors} />;
      case 'timeline':
        return <TimelinePanel events={data.events} />;
      default:
        return <div>Panel not implemented</div>;
    }
  };

  return (
    <div className={cn("bg-gray-900 text-white min-h-[600px] flex flex-col", className)}>
      {/* 헤더 */}
      <div className="bg-gray-800 p-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">CallStack Library DevTools</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className={cn(
                "px-3 py-1 text-sm rounded transition-colors",
                isRefreshing 
                  ? "bg-gray-600 text-gray-300 cursor-not-allowed" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="text-sm text-gray-400">
              {data.events.length} events
            </div>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex space-x-0 overflow-x-auto">
          {mergedConfig.enabledPanels.map(panel => (
            <button
              key={panel}
              onClick={() => setActivePanel(panel)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activePanel === panel
                  ? "text-blue-400 border-blue-400 bg-gray-700"
                  : "text-gray-300 border-transparent hover:text-white hover:bg-gray-700"
              )}
            >
              {panel.charAt(0).toUpperCase() + panel.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* 패널 내용 */}
      <div className="flex-1 overflow-hidden">
        {renderActivePanel()}
      </div>
    </div>
  );
});

// 이벤트 패널
const EventsPanel: React.FC<{ events: any[] }> = memo(({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [filter, setFilter] = useState('');

  const filteredEvents = useMemo(() => {
    if (!filter) return events;
    return events.filter(event => 
      event.type.toLowerCase().includes(filter.toLowerCase()) ||
      JSON.stringify(event.payload).toLowerCase().includes(filter.toLowerCase())
    );
  }, [events, filter]);

  return (
    <div className="flex h-full">
      <div className="w-1/2 border-r border-gray-700">
        <div className="p-3 border-b border-gray-700">
          <input
            type="text"
            placeholder="Filter events..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-1 bg-gray-800 text-white border border-gray-600 rounded text-sm"
          />
        </div>
        <VirtualizedEventList
          events={filteredEvents}
          containerHeight={500}
          onEventSelect={setSelectedEvent}
        />
      </div>
      <div className="w-1/2 p-3">
        {selectedEvent ? (
          <EventDetailView event={selectedEvent} />
        ) : (
          <div className="text-gray-500 text-center py-8">
            Select an event to view details
          </div>
        )}
      </div>
    </div>
  );
});

// 상태 패널
const StatePanel: React.FC<{ state: any }> = memo(({ state }) => {
  const [expandedPath, setExpandedPath] = useState<string[]>([]);

  if (!state) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No state data available
      </div>
    );
  }

  return (
    <div className="p-3 overflow-auto h-full">
      <JSONViewer 
        data={state} 
        expandedPath={expandedPath}
        onExpandToggle={setExpandedPath}
      />
    </div>
  );
});

// 성능 패널
const PerformancePanel: React.FC<{ metrics: any }> = memo(({ metrics }) => {
  if (!metrics) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No performance data available
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4 overflow-auto h-full">
      {/* 처리량 */}
      <div className="bg-gray-800 p-3 rounded">
        <h3 className="text-sm font-semibold mb-2 text-blue-400">Throughput</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Ticks/sec</div>
            <div className="text-white font-mono">{metrics.throughput?.ticksPerSecond?.toFixed(2) || 'N/A'}</div>
          </div>
          <div>
            <div className="text-gray-400">Tasks/sec</div>
            <div className="text-white font-mono">{metrics.throughput?.tasksProcessedPerSecond?.toFixed(2) || 'N/A'}</div>
          </div>
          <div>
            <div className="text-gray-400">Events/sec</div>
            <div className="text-white font-mono">{metrics.throughput?.eventsPerSecond?.toFixed(2) || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* 지연시간 */}
      <div className="bg-gray-800 p-3 rounded">
        <h3 className="text-sm font-semibold mb-2 text-green-400">Latency</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Average</div>
            <div className="text-white font-mono">{metrics.latency?.averageTickTime?.toFixed(2) || 'N/A'}ms</div>
          </div>
          <div>
            <div className="text-gray-400">P50</div>
            <div className="text-white font-mono">{metrics.latency?.p50TickTime?.toFixed(2) || 'N/A'}ms</div>
          </div>
          <div>
            <div className="text-gray-400">P95</div>
            <div className="text-white font-mono">{metrics.latency?.p95TickTime?.toFixed(2) || 'N/A'}ms</div>
          </div>
          <div>
            <div className="text-gray-400">P99</div>
            <div className="text-white font-mono">{metrics.latency?.p99TickTime?.toFixed(2) || 'N/A'}ms</div>
          </div>
        </div>
      </div>

      {/* 에러율 */}
      <div className="bg-gray-800 p-3 rounded">
        <h3 className="text-sm font-semibold mb-2 text-red-400">Errors</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Total Errors</div>
            <div className="text-white font-mono">{metrics.errors?.totalErrors || 0}</div>
          </div>
          <div>
            <div className="text-gray-400">Error Rate</div>
            <div className="text-white font-mono">{((metrics.errors?.errorRate || 0) * 100).toFixed(2)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
});

// 플러그인 패널
const PluginsPanel: React.FC<{ plugins: any[] }> = memo(({ plugins }) => {
  return (
    <div className="p-3 overflow-auto h-full">
      {plugins.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No plugins loaded
        </div>
      ) : (
        <div className="space-y-2">
          {plugins.map((pluginInfo, index) => (
            <div key={index} className="bg-gray-800 p-3 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-white">{pluginInfo.plugin.name}</h3>
                  <p className="text-sm text-gray-400">{pluginInfo.plugin.description}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    ID: {pluginInfo.plugin.id} | Version: {pluginInfo.plugin.version}
                  </div>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  pluginInfo.state === 'active' ? "bg-green-600 text-white" :
                  pluginInfo.state === 'error' ? "bg-red-600 text-white" :
                  "bg-gray-600 text-gray-300"
                )}>
                  {pluginInfo.state}
                </div>
              </div>
              {pluginInfo.error && (
                <div className="mt-2 text-sm text-red-400">
                  Error: {pluginInfo.error.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// Worker 패널
const WorkersPanel: React.FC<{ status: any }> = memo(({ status }) => {
  if (!status) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No worker data available
      </div>
    );
  }

  return (
    <div className="p-3 overflow-auto h-full">
      <div className="bg-gray-800 p-3 rounded">
        <h3 className="text-sm font-semibold mb-3 text-yellow-400">Worker Status</h3>
        <JSONViewer data={status} />
      </div>
    </div>
  );
});

// 에러 패널
const ErrorsPanel: React.FC<{ errors: Error[] }> = memo(({ errors }) => {
  return (
    <div className="p-3 overflow-auto h-full">
      {errors.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No errors recorded
        </div>
      ) : (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div key={index} className="bg-red-900 border border-red-700 p-3 rounded">
              <div className="font-semibold text-red-300">{error.name}</div>
              <div className="text-red-200 text-sm mt-1">{error.message}</div>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-red-300 text-xs cursor-pointer">Stack Trace</summary>
                  <pre className="text-red-200 text-xs mt-1 overflow-auto">{error.stack}</pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// 타임라인 패널
const TimelinePanel: React.FC<{ events: any[] }> = memo(({ events }) => {
  const timelineData = useMemo(() => {
    return events.slice(-100).map((event, index) => ({
      id: event.id,
      timestamp: event.timestamp,
      type: event.type,
      duration: index > 0 ? event.timestamp - events[index - 1].timestamp : 0,
      payload: event.payload
    }));
  }, [events]);

  return (
    <div className="p-3 overflow-auto h-full">
      <div className="space-y-1">
        {timelineData.map((item, index) => (
          <div key={item.id} className="flex items-center space-x-3 text-sm">
            <div className="w-20 text-gray-400 font-mono">
              +{item.duration}ms
            </div>
            <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
            <div className="flex-1 text-white">{item.type}</div>
            <div className="text-gray-400 font-mono">
              {new Date(item.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// 이벤트 상세 뷰
const EventDetailView: React.FC<{ event: any }> = memo(({ event }) => {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-blue-400">Event Details</h3>
        <div className="mt-2 space-y-1 text-sm">
          <div><span className="text-gray-400">Type:</span> <span className="text-white">{event.type}</span></div>
          <div><span className="text-gray-400">ID:</span> <span className="text-white font-mono">{event.id}</span></div>
          <div><span className="text-gray-400">Timestamp:</span> <span className="text-white">{new Date(event.timestamp).toLocaleString()}</span></div>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-green-400">Payload</h4>
        <div className="mt-2">
          <JSONViewer data={event.payload} />
        </div>
      </div>
      {event.metadata && (
        <div>
          <h4 className="text-sm font-semibold text-yellow-400">Metadata</h4>
          <div className="mt-2">
            <JSONViewer data={event.metadata} />
          </div>
        </div>
      )}
    </div>
  );
});

// JSON 뷰어 컴포넌트
const JSONViewer: React.FC<{
  data: any;
  level?: number;
  expandedPath?: string[];
  onExpandToggle?: (path: string[]) => void;
}> = memo(({ data, level = 0, expandedPath = [], onExpandToggle }) => {
  const isExpanded = (key: string) => expandedPath.includes(`${level}-${key}`);
  
  const toggleExpand = (key: string) => {
    const path = `${level}-${key}`;
    const newPath = isExpanded(key)
      ? expandedPath.filter(p => p !== path)
      : [...expandedPath, path];
    onExpandToggle?.(newPath);
  };

  const renderValue = (key: string, value: any): React.ReactNode => {
    if (value === null) return <span className="text-gray-500">null</span>;
    if (value === undefined) return <span className="text-gray-500">undefined</span>;
    
    const valueType = typeof value;
    
    if (valueType === 'string') {
      return <span className="text-green-400">"{value}"</span>;
    }
    
    if (valueType === 'number') {
      return <span className="text-blue-400">{value}</span>;
    }
    
    if (valueType === 'boolean') {
      return <span className="text-yellow-400">{value.toString()}</span>;
    }
    
    if (Array.isArray(value)) {
      return (
        <div>
          <button
            onClick={() => toggleExpand(key)}
            className="text-gray-300 hover:text-white"
          >
            {isExpanded(key) ? '▼' : '▶'} Array[{value.length}]
          </button>
          {isExpanded(key) && (
            <div className="ml-4 mt-1">
              {value.map((item, index) => (
                <div key={index} className="flex">
                  <span className="text-gray-400 mr-2">{index}:</span>
                  <JSONViewer 
                    data={item} 
                    level={level + 1}
                    expandedPath={expandedPath}
                    onExpandToggle={onExpandToggle}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    if (valueType === 'object') {
      const keys = Object.keys(value);
      return (
        <div>
          <button
            onClick={() => toggleExpand(key)}
            className="text-gray-300 hover:text-white"
          >
            {isExpanded(key) ? '▼' : '▶'} Object{`{${keys.length}}`}
          </button>
          {isExpanded(key) && (
            <div className="ml-4 mt-1">
              {keys.map(objKey => (
                <div key={objKey} className="flex">
                  <span className="text-purple-400 mr-2">{objKey}:</span>
                  {renderValue(objKey, value[objKey])}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return <span className="text-gray-300">{String(value)}</span>;
  };

  if (typeof data === 'object' && data !== null) {
    return (
      <div className="font-mono text-xs">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex items-start">
            <span className="text-purple-400 mr-2">{key}:</span>
            {renderValue(key, value)}
          </div>
        ))}
      </div>
    );
  }

  return renderValue('root', data);
});

DevToolsPanel.displayName = 'DevToolsPanel';