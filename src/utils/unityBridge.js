/**
 * UnityBridge — postMessage interface between the website and a Unity WebGL iframe.
 *
 * HOW TO DROP IN A UNITY WEBGL BUILD:
 * 1. Build Unity project targeting WebGL (Unity 6, Brotli or Gzip compression).
 * 2. Copy the build output into /public/trivia/ (index.html, Build/, TemplateData/).
 * 3. Configure your host (Netlify/Vercel) to serve Brotli/Gzip with correct headers:
 *      Content-Encoding: br   (for .br files)
 *      Content-Type:     application/wasm  (for .wasm files)
 * 4. In the Unity project, call the JS function below using jslib:
 *      SendMessage("BridgeReceiver", "OnMessageFromWeb", jsonString);
 * 5. The bridge fires the "trivia-complete" event on the window when Unity sends it.
 *
 * AUDIO SYNC:
 * When audio settings change, call UnityBridge.sendAudioSettings(state) — the iframe
 * receives { type: "audio-settings", volumes: {...}, mutes: {...} }.
 */

/** @type {HTMLIFrameElement|null} */
let unityFrame = null;

const UNITY_ORIGIN = '*'; // Tighten to your deploy domain in production

export const UnityBridge = {
  /** @param {HTMLIFrameElement} iframe */
  attach(iframe) {
    unityFrame = iframe;
    window.addEventListener('message', this._onMessage.bind(this));
  },

  detach() {
    unityFrame = null;
    window.removeEventListener('message', this._onMessage.bind(this));
  },

  /** Send current audio state to the Unity iframe. */
  sendAudioSettings(audioState) {
    this._post({ type: 'audio-settings', ...audioState });
  },

  /** @param {object} payload */
  _post(payload) {
    if (!unityFrame?.contentWindow) return;
    unityFrame.contentWindow.postMessage(JSON.stringify(payload), UNITY_ORIGIN);
  },

  /** @param {MessageEvent} e */
  _onMessage(e) {
    let data;
    try {
      data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
    } catch {
      return;
    }

    if (data?.type === 'trivia-complete') {
      window.dispatchEvent(new CustomEvent('trivia-complete', { detail: { score: data.score } }));
    }
  },
};
