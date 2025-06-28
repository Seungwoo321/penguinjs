import { CodeExecutionResult, TestCase } from './types';
export declare class CodeExecutor {
    private static instance;
    private worker;
    private constructor();
    static getInstance(): CodeExecutor;
    private initWorker;
    executeCode(code: string, testInput?: unknown, timeout?: number): Promise<CodeExecutionResult>;
    runTestCases(code: string, testCases: TestCase[]): Promise<{
        passed: number;
        total: number;
        results: Array<{
            testCase: TestCase;
            result: CodeExecutionResult;
            passed: boolean;
        }>;
    }>;
    destroy(): void;
}
//# sourceMappingURL=executor.d.ts.map