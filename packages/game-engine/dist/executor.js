var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { sanitizeJavaScript } from '@penguinjs/utils';
export class CodeExecutor {
    constructor() {
        this.worker = null;
    }
    static getInstance() {
        if (!CodeExecutor.instance) {
            CodeExecutor.instance = new CodeExecutor();
        }
        return CodeExecutor.instance;
    }
    initWorker() {
        if (this.worker) {
            this.worker.terminate();
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
    `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
        return this.worker;
    }
    executeCode(code_1, testInput_1) {
        return __awaiter(this, arguments, void 0, function* (code, testInput, timeout = 5000) {
            return new Promise((resolve) => {
                const sanitizedCode = sanitizeJavaScript(code);
                const worker = this.initWorker();
                const timeoutId = setTimeout(() => {
                    worker.terminate();
                    resolve({
                        success: false,
                        output: null,
                        error: 'Execution timeout',
                        executionTime: timeout
                    });
                }, timeout);
                worker.onmessage = (e) => {
                    const _a = e.data, { type } = _a, data = __rest(_a, ["type"]);
                    if (type === 'result') {
                        clearTimeout(timeoutId);
                        worker.terminate();
                        resolve({
                            success: data.success,
                            output: data.output,
                            error: data.error,
                            executionTime: data.executionTime
                        });
                    }
                };
                worker.onerror = () => {
                    clearTimeout(timeoutId);
                    worker.terminate();
                    resolve({
                        success: false,
                        output: null,
                        error: 'Worker execution error',
                        executionTime: 0
                    });
                };
                worker.postMessage({ code: sanitizedCode, testInput, timeout });
            });
        });
    }
    runTestCases(code, testCases) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            let passed = 0;
            for (const testCase of testCases) {
                const result = yield this.executeCode(code, testCase.input);
                const testPassed = result.success &&
                    JSON.stringify(result.output) === JSON.stringify(testCase.expectedOutput);
                if (testPassed)
                    passed++;
                results.push({
                    testCase,
                    result,
                    passed: testPassed
                });
            }
            return {
                passed,
                total: testCases.length,
                results
            };
        });
    }
    destroy() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}
//# sourceMappingURL=executor.js.map