import '@testing-library/jest-dom';

// Mock AudioContext for sound tests
class MockOscillator {
  constructor() { this.frequency = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }; }
  connect() { return this; }
  start() {}
  stop() {}
  set type(_) {}
}

class MockGainNode {
  constructor() { this.gain = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), value: 0 }; }
  connect() { return this; }
}

class MockBiquadFilterNode {
  constructor() { this.frequency = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }; this.Q = { value: 0 }; }
  set type(_) {}
  connect() { return this; }
}

class MockAudioContext {
  constructor() { this.currentTime = 0; this.sampleRate = 44100; }
  createOscillator() { return new MockOscillator(); }
  createGain() { return new MockGainNode(); }
  createBiquadFilter() { return new MockBiquadFilterNode(); }
  createBuffer(channels, length, sampleRate) { return { getChannelData: () => new Float32Array(length) }; }
  createBufferSource() {
    return { buffer: null, connect() { return this; }, start() {}, stop() {} };
  }
  get destination() { return {}; }
  close() {}
}

globalThis.AudioContext = MockAudioContext;
globalThis.webkitAudioContext = MockAudioContext;
