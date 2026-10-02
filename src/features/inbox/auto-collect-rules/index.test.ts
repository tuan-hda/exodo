import { expect, it } from 'vitest'
import { applyAutoCollectRules } from './index'

it.each(['WUTHERINGWAVES.KUROGAM', 'Payment for wutheringwaves', 'Merchant: WutheringWaves top-up'])(
  'suggests Wuwa and Entertainment when the content contains WUTHERINGWAVES: %s',
  (content) => {
    expect(applyAutoCollectRules(content)).toEqual({ title: 'Wuwa', category: 'Entertainment' })
  },
)

it.each(['Coffee', 'wuwa'])('leaves unmatched content without suggested defaults: %s', (content) => {
  expect(applyAutoCollectRules(content)).toBeNull()
})
