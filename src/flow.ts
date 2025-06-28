import { Pointer } from './pointer'
import type { PointerOptions } from './pointer'

/**
 * A single onboarding step for PointerJS.
 * @property element CSS selector for the target element
 * @property note The note to display next to the pointer
 * @property url Optional URL to navigate to before this step
 */
export interface OnboardingStep {
  element: string // CSS selector
  note: string
  url?: string
}

/**
 * Options for onboarding flow behavior.
 */
export interface FlowOptions {
  /** Enable keyboard navigation (default: true) */
  keyboardNavigation?: boolean
}

/**
 * Manages the onboarding flow using the Pointer.
 */
export class FlowManager {
  private steps: OnboardingStep[] = []
  private pointer: Pointer | null = null
  private currentStep = 0
  private running = false
  private pointerOptions: PointerOptions
  private flowOptions: FlowOptions
  private keyHandler: ((e: KeyboardEvent) => void) | null = null
  private _prevOverflow: string | undefined = undefined

  /**
   * Create a new FlowManager.
   * @param pointerOptions Options for customizing the pointer
   * @param flowOptions Options for onboarding flow behavior
   */
  constructor(
    pointerOptions: PointerOptions = {},
    flowOptions: FlowOptions = {},
  ) {
    this.pointerOptions = pointerOptions
    this.flowOptions = {
      keyboardNavigation: flowOptions.keyboardNavigation !== false,
    }
  }

  /**
   * Start the onboarding flow with the given steps.
   * @param steps Array of onboarding steps
   */
  start(steps: OnboardingStep[]) {
    if (!Array.isArray(steps) || steps.length === 0) {
      console.warn('[PointerJS] No onboarding steps provided.')
      return
    }
    this.steps = steps
    this.currentStep = 0
    this.running = true
    if (!this.pointer) this.pointer = new Pointer(this.pointerOptions)
    // Disable scroll via JS
    this._prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (this.flowOptions.keyboardNavigation) {
      this.keyHandler = (e: KeyboardEvent) => {
        if (!this.running) return
        if (e.key === 'Enter' || e.key === 'ArrowRight') {
          this.advanceStep()
        } else if (e.key === 'ArrowLeft') {
          this.goBackStep()
        } else if (e.key === 'Escape') {
          this.stop()
        }
      }
      window.addEventListener('keydown', this.keyHandler)
    }
    this.runStep()
  }

  private runStep() {
    if (!this.running || this.currentStep >= this.steps.length) {
      this.stop()
      return
    }
    const step = this.steps[this.currentStep]
    if (step.url && window.location.pathname !== step.url) {
      window.location.href = step.url
      // Wait for navigation, then continue
      window.addEventListener(
        'DOMContentLoaded',
        () => {
          setTimeout(() => this.runStep(), 300)
        },
        { once: true },
      )
      return
    }
    const el = document.querySelector(step.element) as HTMLElement | null
    if (el) {
      this.pointer!.show()
      this.pointer!.moveToElement(el, step.note, this.currentStep === 0)
      // Advance on click of the target element
      const next = () => {
        el.removeEventListener('click', next)
        this.advanceStep()
      }
      el.addEventListener('click', next)
    } else {
      // If element not found, skip to next and warn
      console.warn(
        `[PointerJS] Element not found for selector: '${step.element}' (step ${this.currentStep + 1})`,
      )
      this.advanceStep()
    }
  }

  private advanceStep() {
    this.currentStep++
    this.runStep()
  }

  private goBackStep() {
    if (this.currentStep > 0) {
      this.currentStep--
      this.runStep()
    }
  }

  /**
   * Stop the onboarding flow and hide the pointer.
   */
  stop() {
    this.running = false
    if (this.pointer) {
      this.pointer.hide()
    }
    // Re-enable scroll via JS
    if (this._prevOverflow !== undefined) {
      document.body.style.overflow = this._prevOverflow
      this._prevOverflow = undefined
    }
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler)
      this.keyHandler = null
    }
  }

  /**
   * Set the initial position of the pointer.
   * @param x X coordinate
   * @param y Y coordinate
   */
  setInitialPosition(x: number, y: number) {
    if (!this.pointer) {
      this.pointer = new Pointer(this.pointerOptions)
    }
    this.pointer.setInitialPosition(x, y)
  }
}

// Singleton API for easy integration
let flowManager: FlowManager | null = null
/**
 * Start an onboarding flow with steps and options.
 * @param steps Array of onboarding steps
 * @param pointerOptions Pointer customization options
 * @param event Optional MouseEvent to set initial pointer position
 * @param flowOptions Options for onboarding flow behavior
 */
export function startOnboarding(
  steps: OnboardingStep[],
  pointerOptions: PointerOptions = {},
  event?: MouseEvent,
  flowOptions: FlowOptions = {},
) {
  if (!flowManager) flowManager = new FlowManager(pointerOptions, flowOptions)

  // If event is provided, set initial pointer position
  if (event) {
    const x = event.clientX - 16 // Center the pointer on the click
    const y = event.clientY - 16
    flowManager.setInitialPosition(x, y)
  }

  flowManager.start(steps)
}
