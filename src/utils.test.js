import { describe, it, expect } from 'vitest'
import { cn } from './utils.js'

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })
})
