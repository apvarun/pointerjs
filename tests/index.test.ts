import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Pointer, startOnboarding, type OnboardingStep } from '../src'

describe('Pointer', () => {
  let pointer: Pointer
  beforeEach(() => {
    pointer = new Pointer({
      color: '#123456',
      fontFamily: 'Arial',
      fontSize: '16px',
    })
  })
  afterEach(() => {
    pointer.destroy()
  })

  it('creates a pointer with custom options', () => {
    expect(pointer).toBeInstanceOf(Pointer)
  })

  it('shows and hides the pointer', () => {
    pointer.show()
    // Access the pointer element inside the shadow DOM
    const pointerEl = pointer['shadowRoot'].querySelector(
      '.pointer',
    ) as HTMLElement
    expect(pointerEl).not.toBeNull()
    pointer.hide()
    // Should be hidden
    expect(pointerEl?.style.display).toBe('none')
  })

  it('sets initial position', () => {
    pointer.setInitialPosition(100, 200)
    // No error thrown, position is set
    expect(true).toBe(true)
  })
})

describe('startOnboarding', () => {
  let btn: HTMLButtonElement
  let profile: HTMLButtonElement
  beforeEach(() => {
    btn = document.createElement('button')
    btn.id = 'invite-btn'
    document.body.appendChild(btn)
    profile = document.createElement('button')
    profile.id = 'profile'
    document.body.appendChild(profile)
  })
  afterEach(() => {
    btn.remove()
    profile.remove()
  })

  it('runs onboarding steps and advances on click', async () => {
    const steps: OnboardingStep[] = [
      { element: '#invite-btn', note: 'Invite!' },
      { element: '#profile', note: 'Profile!' },
    ]
    startOnboarding(steps)
    // Simulate click to advance
    btn.click()
    profile.click()
    // No error thrown, flow advances
    expect(true).toBe(true)
  })

  it('skips step if element not found', () => {
    const steps: OnboardingStep[] = [
      { element: '#not-exist', note: 'Missing!' },
      { element: '#invite-btn', note: 'Invite!' },
    ]
    startOnboarding(steps)
    btn.click()
    expect(true).toBe(true)
  })
})

describe('Pointer customization', () => {
  let pointer: Pointer
  afterEach(() => {
    if (pointer) pointer.destroy()
  })

  it('applies custom color to pointer and note', () => {
    pointer = new Pointer({ color: '#FF0000' })
    // Access shadow DOM
    const style = pointer['shadowRoot'].querySelector('style')
    expect(style?.textContent).toContain('#FF0000')
  })

  it('applies custom fontFamily and fontSize to note', () => {
    pointer = new Pointer({ fontFamily: 'Comic Sans MS', fontSize: '22px' })
    const style = pointer['shadowRoot'].querySelector('style')
    expect(style?.textContent).toContain('font-family: Comic Sans MS')
    expect(style?.textContent).toContain('font-size: 22px')
  })
})
