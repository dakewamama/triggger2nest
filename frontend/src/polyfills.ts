import { Buffer } from 'buffer'
import process from 'process'

window.Buffer = window.Buffer || Buffer
window.process = window.process || process

// Fix for EventEmitter3
if (typeof global === 'undefined') {
  window.global = window
}
