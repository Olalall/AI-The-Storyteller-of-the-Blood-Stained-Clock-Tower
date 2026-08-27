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
    fireEvent.error(image as HTMLImageElement)

    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('.role-disc__label')).toHaveTextContent('厨')
  })
})
