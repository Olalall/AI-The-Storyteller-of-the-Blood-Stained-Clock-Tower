import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RoleDisc } from './RoleDisc'

describe('RoleDisc', () => {
  it('falls back to the role initial when an optional image cannot load', () => {
    const { container } = render(
      <RoleDisc initial="厨" roleName="厨师" imageSrc="/assets/characters/missing.webp" size="tiny" />,
    )

    const image = container.querySelector('img')
    expect(image).not.toBeNull()
    expect(image).toHaveAttribute('src', '/assets/characters/missing.webp?assetpack=20261026')
    fireEvent.error(image as HTMLImageElement)

    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('.role-disc__label')).toHaveTextContent('厨')
  })

  it.each([
    ['/assets/characters/chef.webp?quality=1', '/assets/characters/chef.webp?quality=1&assetpack=20261026'],
    ['https://example.test/chef.webp', 'https://example.test/chef.webp'],
  ])('preserves an existing query and leaves external images unchanged: %s', (input, expected) => {
    const { container } = render(<RoleDisc initial="厨" roleName="厨师" imageSrc={input} />)
    expect(container.querySelector('img')).toHaveAttribute('src', expected)
  })
})
