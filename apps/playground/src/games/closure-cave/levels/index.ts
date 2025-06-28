import { beginnerLevels } from './beginner-levels'
import { intermediateLevels } from './intermediate-levels'
import { advancedLevels } from './advanced-levels'

console.log('Loading levels - beginnerLevels:', beginnerLevels)
console.log('Loading levels - intermediateLevels:', intermediateLevels)
console.log('Loading levels - advancedLevels:', advancedLevels)

export const allClosureLevels = {
  beginner: beginnerLevels,
  intermediate: intermediateLevels,
  advanced: advancedLevels
}

export const levels = allClosureLevels

console.log('Exported allClosureLevels:', allClosureLevels)