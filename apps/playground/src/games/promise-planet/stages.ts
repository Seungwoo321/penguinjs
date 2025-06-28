import { GameStage } from '@penguinjs/game-engine'

export const promisePlanetStages: GameStage[] = [
  {
    id: 'pp-1',
    title: '첫 번째 Promise 만들기',
    description: 'Promise를 생성하고 resolve를 호출해보세요.',
    difficulty: 'beginner',
    concept: 'promise-basics',
    initialCode: `function createPromise() {
  // Promise를 만들어 "Hello Promise!"를 resolve하세요
  
}

const promise = createPromise();`,
    solution: `function createPromise() {
  return new Promise((resolve) => {
    resolve("Hello Promise!");
  });
}

const promise = createPromise();
return promise;`,
    testCases: [
      {
        id: 'tc-1',
        input: undefined,
        expectedOutput: Promise.resolve("Hello Promise!"),
        description: 'Promise가 "Hello Promise!"로 resolve되어야 합니다'
      }
    ],
    hints: [
      'new Promise() 생성자를 사용하세요',
      'resolve 콜백을 받아서 호출하세요',
      'resolve에 문자열을 전달하세요'
    ],
    explanation: 'Promise는 비동기 작업의 최종 완료 또는 실패를 나타내는 객체입니다. resolve는 성공적인 결과를 전달할 때 사용합니다.'
  },
  {
    id: 'pp-2',
    title: 'Promise 체이닝',
    description: 'then을 사용해 Promise를 체이닝해보세요.',
    difficulty: 'beginner',
    concept: 'promise-chaining',
    initialCode: `function chainPromise() {
  return Promise.resolve(5)
    // .then()을 사용해 값을 2배로 만드세요
    // 다시 .then()을 사용해 10을 더하세요
}

const result = chainPromise();`,
    solution: `function chainPromise() {
  return Promise.resolve(5)
    .then(value => value * 2)
    .then(value => value + 10);
}

const result = chainPromise();
return result;`,
    testCases: [
      {
        id: 'tc-1',
        input: undefined,
        expectedOutput: Promise.resolve(20),
        description: 'Promise가 20으로 resolve되어야 합니다'
      }
    ],
    hints: [
      '.then()은 새로운 Promise를 반환합니다',
      '각 then에서 값을 변환할 수 있습니다',
      '체이닝을 통해 순차적으로 처리하세요'
    ],
    explanation: 'Promise 체이닝을 사용하면 비동기 작업을 순차적으로 연결할 수 있습니다. 각 then은 이전 결과를 받아 처리합니다.'
  }
]