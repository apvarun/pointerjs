/**
 * Options for customizing the pointer appearance.
 */
export interface PointerOptions {
  /** Pointer color (default: #8BD3E6) */
  color?: string
  /** Font family for notes (default: inherit) */
  fontFamily?: string
  /** Font size for notes (default: 14px) */
  fontSize?: string
  /** Animation speed in ms (default: 400) */
  animationSpeed?: number
  /** Pointer size in px (default: 32) */
  pointerSize?: number
  /** Pointer style ("arrow" | "hand" | "circle", default: "arrow") */
  pointerStyle?: 'arrow' | 'hand' | 'circle'
}

/**
 * Animated pointer for visually guiding users to elements on the page.
 */
export class Pointer {
  private shadowRoot: ShadowRoot
  private pointerEl: HTMLElement
  private noteEl: HTMLElement
  private container: HTMLElement
  private currentX: number
  private currentY: number
  private animating = false
  private options: PointerOptions

  /**
   * Create a new Pointer instance.
   * @param options PointerOptions for customizing appearance
   */
  constructor(options: PointerOptions = {}) {
    this.options = {
      color: options.color || '#8BD3E6',
      fontFamily: options.fontFamily || 'inherit',
      fontSize: options.fontSize || '14px',
      animationSpeed: options.animationSpeed ?? 400,
      pointerSize: options.pointerSize ?? 32,
      pointerStyle: options.pointerStyle || 'arrow',
    }
    // Create a container and attach shadow DOM
    this.container = document.createElement('div')
    this.container.style.position = 'fixed'
    this.container.style.top = '0'
    this.container.style.left = '0'
    this.container.style.width = '100vw'
    this.container.style.height = '100vh'
    this.container.style.pointerEvents = 'none'
    this.container.style.zIndex = '999999'
    document.body.append(this.container)
    this.shadowRoot = this.container.attachShadow({ mode: 'open' })

    // Inject styles
    const style = document.createElement('style')
    style.textContent = `
      .pointer {
        width: ${this.options.pointerSize ?? 32}px;
        height: ${this.options.pointerSize ?? 32}px;
        background: transparent;
        position: absolute;
        left: 0;
        top: 0;
        z-index: 2;
        pointer-events: none;
      }
      .pointer-triangle {
        position: absolute;
        left: 0;
        top: 8px;
        width: 0;
        height: 0;
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
        border-right: 16px solid ${this.options.color};
        border-radius: 8px;
        z-index: 1;
      }
      .note {
        position: absolute;
        /* Position bottom right of pointer with offset */
        left: unset;
        top: unset;
        background: ${this.options.color};
        color: #fff;
        padding: 12px 24px;
        border-radius: 16px;
        font-size: ${this.options.fontSize};
        box-shadow: 0 2px 16px 0 ${this.options.color}22;
        white-space: pre-line;
        pointer-events: auto;
        z-index: 10;
        font-family: ${this.options.fontFamily};
        transition: background 0.2s, color 0.2s, font-size 0.2s, font-family 0.2s;
      }
    `
    this.shadowRoot.append(style)

    // Pointer element (SVG icon)
    this.pointerEl = document.createElement('div')
    this.pointerEl.className = 'pointer'
    const size = this.options.pointerSize ?? 32
    let pointerSVG = ''
    if (this.options.pointerStyle === 'hand') {
      pointerSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 800 800" fill="none">
            <path fill="${this.options.color}" d="M587.5 262.5a86.965 86.965 0 0 0-45.756 12.953 87.449 87.449 0 0 0-49.633-45.292A87.435 87.435 0 0 0 425 233.459V112.5a87.502 87.502 0 0 0-149.372-61.872A87.502 87.502 0 0 0 250 112.5v285.656l-21.872-37.884a87.5 87.5 0 0 0-152.094 86.55C177.428 660.622 244.978 750 400 750a275.311 275.311 0 0 0 275-275V350a87.602 87.602 0 0 0-25.656-61.844A87.602 87.602 0 0 0 587.5 262.5Z"/>
        </svg>
      `
    } else if (this.options.pointerStyle === 'circle') {
      pointerSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="12" fill="${this.options.color}" />
        </svg>
      `
    } else {
      // Default: arrow
      pointerSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="none" viewBox="0 0 24 24">
          <path fill="${this.options.color}" d="M19.503 9.97c1.204.489 1.112 2.224-.137 2.583l-6.306 1.813-2.88 5.895c-.57 1.168-2.295.957-2.568-.314L4.677 6.257A1.369 1.369 0 0 1 6.53 4.7L19.503 9.97Z" clip-rule="evenodd"/>
        </svg>
      `
    }
    this.pointerEl.innerHTML = pointerSVG
    this.shadowRoot.append(this.pointerEl)

    // Note element
    this.noteEl = document.createElement('div')
    this.noteEl.className = 'note'
    this.noteEl.style.display = 'none'
    // Accessibility: ARIA attributes
    this.noteEl.setAttribute('role', 'status')
    this.noteEl.setAttribute('aria-live', 'polite')
    this.noteEl.setAttribute('tabindex', '0')
    this.shadowRoot.append(this.noteEl)

    // Start pointer at center of screen
    this.currentX = window.innerWidth / 2
    this.currentY = window.innerHeight / 2
    this.pointerEl.style.left = `${this.currentX}px`
    this.pointerEl.style.top = `${this.currentY}px`
  }

  /**
   * Move the pointer to a target element and optionally show a note.
   * @param target HTMLElement to point to
   * @param note Optional note to display
   * @param isFirstStep Flag indicating if this is the first step of the animation
   */
  moveToElement(target: HTMLElement, note?: string, isFirstStep?: boolean) {
    const rect = target.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    if (rect.top < 0) {
      window.scrollTo({
        top: window.scrollY + rect.top - 100,
        behavior: 'smooth',
      })
    } else if (rect.bottom > viewportHeight) {
      window.scrollTo({
        top: window.scrollY + rect.bottom - viewportHeight + 100,
        behavior: 'smooth',
      })
    }
    setTimeout(() => {
      const updatedRect = target.getBoundingClientRect()
      const pointerSize = this.options.pointerSize ?? 32
      const margin = 8
      // Estimate note height for flip logic
      let noteHeight = 48
      if (this.noteEl && note) {
        this.noteEl.textContent = note
        this.noteEl.style.display = 'block'
        this.noteEl.style.visibility = 'hidden'
        this.noteEl.style.opacity = '0'
        this.noteEl.style.left = '-9999px'
        this.noteEl.style.top = '-9999px'
        noteHeight = this.noteEl.offsetHeight || 48
      }
      // Determine if we need to flip (note above)
      const offsetY = pointerSize + 8
      let flip = false
      if (updatedRect.bottom + offsetY + noteHeight > viewportHeight - margin) {
        flip = true
      }
      // Pointer always points to the element's corner
      let pointerX = updatedRect.right - pointerSize
      let pointerY = flip
        ? updatedRect.top - pointerSize - margin
        : updatedRect.bottom + margin
      pointerX = Math.min(pointerX, viewportWidth - pointerSize - margin)
      pointerY = Math.min(pointerY, viewportHeight - pointerSize - margin)
      pointerX = Math.max(margin, pointerX)
      pointerY = Math.max(margin, pointerY)
      this.animateTo(pointerX, pointerY, note, isFirstStep, flip)
    }, 300)
  }

  private animateTo(
    x: number,
    y: number,
    note?: string,
    isFirstStep?: boolean,
    flip?: boolean,
  ) {
    if (this.animating) return
    this.animating = true
    const duration = this.options.animationSpeed ?? 400 // ms
    const startX = this.currentX
    const startY = this.currentY
    const deltaX = x - startX
    const deltaY = y - startY
    const startTime = performance.now()
    const pointerEl = this.pointerEl
    const noteEl = this.noteEl
    const pointerSize = this.options.pointerSize ?? 32
    let noteWidth = 0
    let noteHeight = 0
    if (note) {
      noteEl.textContent = note
      noteEl.style.display = 'block'
      noteEl.style.visibility = 'hidden'
      noteEl.style.opacity = '0'
      noteEl.style.left = '-9999px'
      noteEl.style.top = '-9999px'
      noteWidth = noteEl.offsetWidth
      noteHeight = noteEl.offsetHeight
      noteEl.setAttribute('aria-label', note)
    }
    const margin = 8
    if (isFirstStep && note) {
      noteEl.style.opacity = '0'
      noteEl.style.transition = 'opacity 0.4s'
      noteEl.style.visibility = 'hidden'
    } else if (note) {
      noteEl.style.opacity = '1'
      noteEl.style.transition = ''
      noteEl.style.visibility = 'visible'
    }
    const animate = (now: number) => {
      const elapsed = Math.min((now - startTime) / duration, 1)
      const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)
      const t = ease(elapsed)
      const curX = startX + deltaX * t
      const curY = startY + deltaY * t
      pointerEl.style.left = `${curX}px`
      pointerEl.style.top = `${curY}px`
      // Flip pointer vertically/horizontally if needed
      let flipX = false
      const flipY = !!flip
      if (note) {
        const offsetX = pointerSize + 12
        const offsetY = pointerSize + 8
        let noteLeft = curX + offsetX
        const noteTop = flip ? curY - noteHeight - 12 : curY + offsetY
        // Flip horizontally if overflowing right
        if (noteLeft + noteWidth > window.innerWidth - margin) {
          noteLeft = window.innerWidth - noteWidth - 12
          flipX = true
        }
        // If both, place top left
        if (curX + offsetX + noteWidth > window.innerWidth - margin && flip) {
          noteLeft = window.innerWidth - noteWidth - 12
          flipX = true
        }
        noteEl.style.left = `${noteLeft}px`
        noteEl.style.top = `${noteTop}px`
        noteEl.style.display = 'block'
        noteEl.style.transform = ''
        // Set pointer transform
        if (flipX && flipY) {
          pointerEl.style.transform = 'scaleX(-1) scaleY(-1)'
        } else if (flipX) {
          pointerEl.style.transform = 'scaleX(-1)'
        } else if (flipY) {
          pointerEl.style.transform = 'scaleY(-1)'
        } else {
          pointerEl.style.transform = ''
        }
        if (!isFirstStep) {
          noteEl.style.opacity = '1'
          noteEl.style.visibility = 'visible'
        }
        if (elapsed === 1) {
          if (isFirstStep) {
            setTimeout(() => {
              noteEl.style.visibility = 'visible'
              noteEl.style.opacity = '1'
            }, 10)
          }
          noteEl.focus()
        }
      } else {
        noteEl.style.display = 'none'
        noteEl.removeAttribute('aria-label')
        pointerEl.style.transform = ''
      }
      if (elapsed < 1) {
        requestAnimationFrame(animate)
      } else {
        this.currentX = x
        this.currentY = y
        this.animating = false
      }
    }
    requestAnimationFrame(animate)
  }

  /**
   * Hide the pointer and note.
   */
  hide(): void {
    this.pointerEl.style.display = 'none'
    this.noteEl.style.display = 'none'
  }

  /**
   * Show the pointer.
   */
  show(): void {
    this.pointerEl.style.display = 'block'
    // Accessibility: focus the note if visible
    if (this.noteEl.style.display !== 'none') {
      this.noteEl.focus()
    }
  }

  /**
   * Set the initial position of the pointer.
   * @param x X coordinate
   * @param y Y coordinate
   */
  setInitialPosition(x: number, y: number): void {
    this.currentX = x
    this.currentY = y
    this.pointerEl.style.left = `${x}px`
    this.pointerEl.style.top = `${y}px`
  }

  /**
   * Remove the pointer from the DOM.
   */
  destroy(): void {
    this.container.remove()
  }
}
