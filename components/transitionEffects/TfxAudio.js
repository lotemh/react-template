
class TfxAudio {
    constructor() {
        this.tfxActive = false;
        this.startTime = 0;
        this.duration = 0;
    }

    play(player) {
        if (this.tfxActive)
            return;

        this.tfxActive = true;
        this.connect(player);

        window.setTimeout(() => {
            this.disconnect(player);
        }, this.duration);
    }

    connect(player) {
        let nodes = this.tfx(player);
        if (!Array.isArray(nodes)) {
            nodes = [nodes];
        }
        const firstNode = nodes.shift();
        const lastNode = nodes.pop() || firstNode;
        const source = player.getMediaElementSource();
        const audioCtx = player.getAudioContext();

        source.disconnect();
        source.connect(firstNode);
        lastNode.connect(audioCtx.destination);
    }

    disconnect(player) {
        const source = player.getMediaElementSource();
        const audioCtx = player.getAudioContext();
        source.connect(audioCtx.destination);
        this.tfxActive = false;
    }
}

class TfxAudioFadeIn extends TfxAudio {
    constructor (duration) {
        super();
        this.duration = duration;
    }

    tfx(player) {
        const audioCtx = player.getAudioContext();
        const gainNode = audioCtx.createGain();

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(1.0, audioCtx.currentTime + this.duration / 1000);

        return gainNode;
    }
}

class TfxAudioFadeOut extends TfxAudio {
    constructor (duration) {
        super();
        this.duration = duration;
    }

    tfx(player) {
        const audioCtx = player.getAudioContext();
        const gainNode = audioCtx.createGain();

        gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + this.duration / 1000);

        return gainNode;
    }
}

const TFX_AUDIO = {
    IN: new TfxAudioFadeIn(40),
    NO_ACTION_OUT: new TfxAudioFadeOut(1000),
}

export { TFX_AUDIO, TfxAudioFadeIn, TfxAudioFadeOut };
