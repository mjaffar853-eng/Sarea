import * as THREE from 'three'
import Experience from '../../Experience'

export default class AudioManager {
    constructor() {
        this.experience = new Experience()
        this.camera = this.experience.camera.instance
        this.listener = new THREE.AudioListener()
        this.camera.add(this.listener)

        this.sounds = new Map()

        // Create master gain for global volume/mute control
        this.masterGain = this.listener.context.createGain()
        this.masterGain.connect(this.listener.context.destination)

        this.masterVolume = 1
        this.muted = false

        this.maxPositional = 64
        this.currentPositionalCount = 0

        // Resume audio on first user interaction (mobile autoplay policy)
        window.addEventListener('pointerdown', () => this.resumeAudioContext(), { once: true })
    }

    /** Resume audio context (mobile + browser autoplay policy) */
    resumeAudioContext() {
        const ctx = this.listener.context
        if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
            ctx.resume()
        }
    }

    /**
     * Create a sound entry from a preloaded AudioBuffer
     * @param {string} id unique id
     * @param {object} options
     *   - buffer: AudioBuffer (from Resources)
     *   - type: 'global' | 'positional'
     *   - volume, loop, refDistance, rolloffFactor
     */
    create(id, options = {}) {
        const { buffer, type = 'global', volume = 1, loop = false } = options

        if (!buffer) {
            console.warn(`AudioManager.create: Missing AudioBuffer for '${id}'`)
            return null
        }

        let audio
        if (type === 'positional') {
            if (this.currentPositionalCount >= this.maxPositional) {
                console.warn(`AudioManager: positional limit reached, fallback to global for '${id}'`)
                audio = new THREE.Audio(this.listener)
            } else {
                audio = new THREE.PositionalAudio(this.listener)
                audio.setRefDistance(options.refDistance ?? 20)
                audio.setRolloffFactor(options.rolloffFactor ?? 1)
                this.currentPositionalCount++
            }
        } else {
            audio = new THREE.Audio(this.listener)
        }

        audio.setBuffer(buffer)
        audio.setLoop(loop)
        audio.setVolume(volume)
        audio.gain.disconnect() // disconnect default destination
        audio.gain.connect(this.masterGain) // route through master gain

        this.sounds.set(id, { audio, options })
        return audio
    }

    /** Attach positional audio to a 3D object */
    attach(id, object3d) {
        const entry = this.sounds.get(id)
        if (!entry) {
            console.warn(`AudioManager.attach: unknown id '${id}'`)
            return
        }
        object3d.add(entry.audio)
    }

    /** Play an existing sound */
    play(id, opts = {}) {
        const entry = this.sounds.get(id)
        if (!entry) return
        const { audio } = entry
        if (typeof opts.volume === 'number') audio.setVolume(opts.volume)
        if (typeof opts.loop === 'boolean') audio.setLoop(opts.loop)

        try {
            if (!audio.isPlaying) audio.play()
        } catch (err) {
            console.warn(`AudioManager.play error for '${id}':`, err)
        }
    }

    /** Stop a specific sound */
    stop(id) {
        const entry = this.sounds.get(id)
        if (!entry) return
        try {
            entry.audio.stop()
        } catch { /* ignore */ }
    }

    /** Stop all sounds */
    stopAll() {
        for (const [id, entry] of this.sounds) {
            try { entry.audio.stop() } catch { /* ignore */ }
        }
    }

    /** Set master volume (0–1) */
    setMasterVolume(v) {
        this.masterVolume = Math.max(0, Math.min(1, v))
        this.masterGain.gain.value = this.masterVolume * (this.muted ? 0 : 1)
    }

    /** Mute/unmute all audio */
    setMuted(flag) {
        this.muted = !!flag
        this.masterGain.gain.value = this.muted ? 0 : this.masterVolume
    }

    /** Smooth fade a sound in/out */
    fade(id, { from = null, to = 0, duration = 1, onComplete = null } = {}) {
        const entry = this.sounds.get(id)
        if (!entry) return
        const audio = entry.audio
        const start = from ?? audio.getVolume()
        const target = Math.max(0, Math.min(1, to))
        const startTime = performance.now()

        const step = (now) => {
            const t = Math.min(1, (now - startTime) / (duration * 1000))
            const value = start + (target - start) * t
            audio.setVolume(value)
            if (t < 1) requestAnimationFrame(step)
            else if (onComplete) onComplete()
        }
        requestAnimationFrame(step)
    }

    /** Completely remove a sound */
    dispose(id) {
        const entry = this.sounds.get(id)
        if (!entry) return
        try { entry.audio.stop() } catch { /* ignore */ }
        if (entry.audio.isPositionalAudio) this.currentPositionalCount--
        this.sounds.delete(id)
    }

    /** Get THREE.Audio or THREE.PositionalAudio instance */
    get(id) {
        const entry = this.sounds.get(id)
        return entry ? entry.audio : null
    }
}
