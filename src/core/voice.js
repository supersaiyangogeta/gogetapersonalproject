/*
 * VOICE — an event hook, not an audio library.
 *
 * The project ships no recorded dialogue and downloads none. Every spoken line
 * raises a cue instead: who said it, the written line, the original Japanese
 * where we have it, the delivery style, and the language the player asked for.
 * A provider — a voice pack somebody installs locally, or original recordings
 * made for the project later — registers itself and receives those cues:
 *
 *   SL.Voice.provider = { play(cue) { ... } };
 *
 * Settings (audio):
 *   voice             'off' (default) | 'jp' | 'en'
 *   subtitleLanguage  'both' (default) | 'en' | 'jp'
 *
 * A provider that throws is ignored: a voice pack must never take the game down.
 */
(function () {
  'use strict';

  SL.Voice = {
    provider: null,
    lastCue: null,

    /** Called for every line; returns the cue it raised. */
    cue(ev) {
      const audio = (SL.Settings && SL.Settings.data && SL.Settings.data.audio) || {};
      const mode = audio.voice || 'off';
      const cue = {
        key: ev.voice || (ev.speakerId ? ev.speakerId + ':' + String(ev.jp || ev.line || '').slice(0, 24) : null),
        speaker: ev.speakerId || null,
        line: ev.line || null,
        jp: ev.jp || null,
        style: ev.style || null,
        language: mode,
      };
      this.lastCue = cue;
      if (mode === 'off' || !this.provider || !this.provider.play) return cue;
      try {
        this.provider.play(cue);
      } catch (e) {
        /* a voice pack must never take the game down */
      }
      return cue;
    },
  };
})();
