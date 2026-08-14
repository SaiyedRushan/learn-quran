// AudioWorklet processor for recitation practice: downsamples mic input to
// 16 kHz mono and posts fixed-size Float32Array chunks to the main thread.
//
// Decimation averages each group of input samples rather than picking one of
// them. Nearest-sample decimation folds everything above 8 kHz back into the
// band Whisper's mel front-end reads, which is free damage to recognition
// accuracy. The fractional read position carries across process() calls so
// blocks don't each restart the phase.
const TARGET_RATE = 16000;
const CHUNK_SAMPLES = 2400; // 150 ms at 16 kHz

class ReciteAudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = [];
    this._acc = 0;
    this._accCount = 0;
    this._pos = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channelData = input[0];
    const ratio = sampleRate / TARGET_RATE;

    if (ratio <= 1.0001) {
      // Context already at (or below) 16 kHz — nothing to decimate.
      for (let i = 0; i < channelData.length; i++) this._buffer.push(channelData[i]);
    } else {
      for (let i = 0; i < channelData.length; i++) {
        this._acc += channelData[i];
        this._accCount++;
        this._pos++;
        if (this._pos >= ratio) {
          this._pos -= ratio;
          this._buffer.push(this._acc / this._accCount);
          this._acc = 0;
          this._accCount = 0;
        }
      }
    }

    while (this._buffer.length >= CHUNK_SAMPLES) {
      const chunk = new Float32Array(this._buffer.splice(0, CHUNK_SAMPLES));
      this.port.postMessage(chunk.buffer, [chunk.buffer]);
    }

    return true;
  }
}

registerProcessor("recite-audio-processor", ReciteAudioProcessor);
