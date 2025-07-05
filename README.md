[![npm version](https://img.shields.io/npm/v/pointerjs.svg)](https://www.npmjs.com/package/pointerjs)
[![bundle size](https://badgen.net/bundlephobia/minzip/pointerjs)](https://bundlephobia.com/result?p=pointerjs)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

# PointerJS

A tiny JavaScript library to visually guide users with an animated pointer and onboarding flow.

## Features

- Animated pointer to highlight elements
- Onboarding flow with notes
- Customizable colors and styles
- Zero dependencies

## Installation

```bash
npm install pointerjs
# or
bun add pointerjs
# or
pnpm add pointerjs
```

## Usage

### Basic Onboarding

```js
import { startOnboarding } from 'pointerjs'

startOnboarding([
  { element: '#invite-btn', note: 'Click on the invite team button' },
  { element: '#profile', note: 'Check your profile here!' },
])
```

### Advanced: Custom Pointer Options

```js
startOnboarding([{ element: '#invite-btn', note: 'Invite your team!' }], {
  color: '#FF6F61',
  fontFamily: 'monospace',
  fontSize: '18px',
})
```

### Onboarding with URLs

```js
startOnboarding([
  { element: '#step1', note: 'Step 1', url: '/page1' },
  { element: '#step2', note: 'Step 2', url: '/page2' },
])
```

### Using the Pointer Class Directly

```js
import { Pointer } from 'pointerjs'

const pointer = new Pointer({ color: '#00C853' })
pointer.moveToElement(document.querySelector('#my-element'), 'Hello!')
```

Or use via CDN:

```html
<script src="https://unpkg.com/pointerjs"></script>
<script>
  PointerJS.startOnboarding([...])
</script>
```

## API

### `startOnboarding(steps, options?, event?)`

- `steps`: Array of `{ element, note, url? }`
- `options`: Pointer customization (color, fontFamily, fontSize)
- `event`: Optional MouseEvent to set initial pointer position

## Demo

See the [demo](./demo/index.html) for a working example.

## Contributing

Pull requests and issues are welcome!

## License

MIT © [Varun A P](https://github.com/apvarun)
