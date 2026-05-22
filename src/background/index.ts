import { saveImage, deleteImage, toggleFavorite, clearAll } from '../shared/storage';
import type { MessageType } from '../shared/types';

// ── Keep the service worker alive ─────────────────────────────────────────────
// MV3 service workers terminate after ~30s idle. We ping ourselves every 20s
// so the worker stays alive while Chrome is open.
const keepAlive = () => {
  setTimeout(() => {
    chrome.runtime.getPlatformInfo(() => keepAlive());
  }, 20_000);
};
keepAlive();

// ── Message handler ───────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message: MessageType, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((err) => {
      console.error('[VicPic background] error:', err);
      sendResponse({ saved: false, error: String(err) });
    });
  return true; // MUST return true to keep channel open for async sendResponse
});

async function handleMessage(message: MessageType): Promise<unknown> {
  switch (message.type) {

    case 'SAVE_IMAGE': {
      const { imageUrl, pageUrl, pageTitle, timestamp, domain, faviconUrl } = message.payload;

      // Reject obviously bad URLs before hitting storage
      if (!imageUrl || imageUrl.startsWith('data:') || imageUrl.length < 10) {
        return { saved: false, reason: 'invalid_url' };
      }

      const result = await saveImage({ imageUrl, pageUrl, pageTitle, timestamp, domain, faviconUrl });

      if (result.saved && result.image) {
        // Notify popup if it's open — ignore error if it's closed
        chrome.runtime.sendMessage({ type: 'IMAGE_SAVED', payload: result.image }).catch(() => {});
      }

      return result; // { saved: true/false, image? }
    }

    case 'DELETE_IMAGE':
      await deleteImage(message.payload.id);
      return { success: true };

    case 'TOGGLE_FAVORITE':
      await toggleFavorite(message.payload.id);
      return { success: true };

    case 'CLEAR_ALL':
      await clearAll();
      return { success: true };

    default:
      return { saved: false, error: 'unknown_message_type' };
  }
}