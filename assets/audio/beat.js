// Beat sound generator using Web Audio API
class BeatSound {
    constructor(audioContext) {
        this.audioContext = audioContext;
    }

    play(frequency = 440, duration = 0.1) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playBeat() {
        this.play(440, 0.1); // A4 note
    }

    playSuccess() {
        this.play(523.25, 0.2); // C5 note
    }

    playError() {
        this.play(392, 0.2); // G4 note
    }
}

export default BeatSound; 