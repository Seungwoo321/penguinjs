import { sanitizeJavaScript } from '@penguinjs/utils'
import { CodeExecutionResult, TestCase } from './types'

export class CodeExecutor {
  private static instance: CodeExecutor
  private worker: Worker | null = null

  private constructor() {}

  static getInstance(): CodeExecutor {
    if (!CodeExecutor.instance) {
      CodeExecutor.instance = new CodeExecutor()
    }
    return CodeExecutor.instance
  }

  private initWorker(): Worker {
    if (this.worker) {
      this.worker.terminate()
    }

    const workerCode = `
      self.onmessage = function(e) {
        const { code, testInput, timeout = 5000 } = e.data;
        
        const startTime = performance.now();
        
        try {
          // Create isolated environment
          const context = {
            console: {
              log: (...args) => {
                self.postMessage({
                  type: 'log',
                  data: args.join(' ')
                });
              }
            }
          };
          
          // Execute code in isolated context
          const func = new Function('context', 'input', \`
            with (context) {
              \${code}
            }
          \`);
          
          const result = func(context, testInput);
          const executionTime = performance.now() - startTime;
          
          self.postMessage({
            type: 'result',
            success: true,
            output: result,
            executionTime
          });
        } catch (error) {
          const executionTime = performance.now() - startTime;
          self.postMessage({
            type: 'result',
            success: false,
            error: error.message,
            executionTime
          });
        }
      };
    `

    const blob = new Blob([workerCode], { type: 'application/javascript' })
    this.worker = new Worker(URL.createObjectURL(blob))
    
    return this.worker
  }

  async executeCode(
    code: string, 
    testInput?: unknown, 
    timeout: number = 5000
  ): Promise<CodeExecutionResult> {
    return new Promise((resolve) => {
      const sanitizedCode = sanitizeJavaScript(code)
      const worker = this.initWorker()
      
      const timeoutId = setTimeout(() => {
        worker.terminate()
        resolve({
          success: false,
          output: null,
          error: 'Execution timeout',
          executionTime: timeout
        })
      }, timeout)

      worker.onmessage = (e) => {
        const { type, ...data } = e.data
        
        if (type === 'result') {
          clearTimeout(timeoutId)
          worker.terminate()
          resolve({
            success: data.success,
            output: data.output,
            error: data.error,
            executionTime: data.executionTime
          })
        }
      }

      worker.onerror = () => {
        clearTimeout(timeoutId)
        worker.terminate()
        resolve({
          success: false,
          output: null,
          error: 'Worker execution error',
          executionTime: 0
        })
      }

      worker.postMessage({ code: sanitizedCode, testInput, timeout })
    })
  }

  async runTestCases(code: string, testCases: TestCase[]): Promise<{
    passed: number
    total: number
    results: Array<{ testCase: TestCase; result: CodeExecutionResult; passed: boolean }>
  }> {
    const results = []
    let passed = 0

    for (const testCase of testCases) {
      const result = await this.executeCode(code, testCase.input)
      const testPassed = result.success && 
        JSON.stringify(result.output) === JSON.stringify(testCase.expectedOutput)
      
      if (testPassed) passed++
      
      results.push({
        testCase,
        result,
        passed: testPassed
      })
    }

    return {
      passed,
      total: testCases.length,
      results
    }
  }

  destroy(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
  }
}