// Background music generator using Web Audio API
class MusicGenerator {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.isPlaying = false;
        this.notes = [
            261.63, // C4
            293.66, // D4
            329.63, // E4
            349.23, // F4
            392.00, // G4
            440.00, // A4
            493.88  // B4
        ];
    }

    createOscillator(frequency) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        return { oscillator, gainNode };
    }

    playNote(frequency, startTime, duration) {
        const { oscillator, gainNode } = this.createOscillator(frequency);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }

    playChord(notes, startTime, duration) {
        notes.forEach(frequency => {
            this.playNote(frequency, startTime, duration);
        });
    }

    start() {
        if (this.isPlaying) return;
        this.isPlaying = true;

        const startTime = this.audioContext.currentTime;
        const beatDuration = 0.5; // Half a second per beat

        // Play a simple progression
        for (let i = 0; i < 8; i++) {
            const time = startTime + (i * beatDuration);
            
            // Play different chords based on the beat
            switch (i % 4) {
                case 0:
                    this.playChord([this.notes[0], this.notes[2], this.notes[4]], time, beatDuration);
                    break;
                case 1:
                    this.playChord([this.notes[2], this.notes[4], this.notes[6]], time, beatDuration);
                    break;
                case 2:
                    this.playChord([this.notes[4], this.notes[6], this.notes[1]], time, beatDuration);
                    break;
                case 3:
                    this.playChord([this.notes[6], this.notes[1], this.notes[3]], time, beatDuration);
                    break;
            }
        }

        // Schedule the next sequence
        setTimeout(() => {
            if (this.isPlaying) {
                this.start();
            }
        }, 4000); // 8 beats * 0.5 seconds = 4 seconds
    }

    stop() {
        this.isPlaying = false;
    }
}

export default MusicGenerator; 