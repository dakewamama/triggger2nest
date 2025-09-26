import { Buffer } from 'buffer';
import process from 'process';

// Set up globals
(window as any).Buffer = Buffer;
(window as any).process = process;
(window as any).global = window;

console.log('✅ Polyfills loaded');
