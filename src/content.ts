// DOM Selectors for Google Meet captions
const SELECTORS = {
  captionContainer: '.nMcdL.bj4p3b',
  captionText: '.ygicle.VbkSUe',
  speaker: '.adE6rb',
} as const;

interface Caption {
  speaker: string;
  text: string;
}

function getCaptions(): Caption[] {
  const captionItems = document.querySelectorAll(SELECTORS.captionContainer);
  const speakers = document.querySelectorAll(SELECTORS.speaker);

  const captions: Caption[] = [];

  captionItems.forEach((item, index) => {
    const text = item.querySelector(SELECTORS.captionText)?.textContent || '';
    const speaker = speakers[index]?.textContent || '';
    if (text) {
      captions.push({ speaker, text });
    }
  });

  return captions;
}

function formatCaptions(captions: Caption[]): string {
  return captions.map((c) => `${c.speaker}: ${c.text}`).join('\n');
}

async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern Clipboard API first
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback to execCommand for cases where Clipboard API fails
    // (e.g., when page doesn't have focus from popup click)
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  }
}

function showToast(message: string, isError = false): void {
  const existingToast = document.getElementById('capcopy-toast');
  existingToast?.remove();

  // Add animation keyframes if not already added
  if (!document.getElementById('capcopy-style')) {
    const style = document.createElement('style');
    style.id = 'capcopy-style';
    style.textContent = `
      @keyframes capcopy-fadein {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  const toast = document.createElement('div');
  toast.id = 'capcopy-toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${isError ? '#d93025' : '#34a853'};
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 2147483647;
    font-family: 'Google Sans', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: capcopy-fadein 0.2s ease-out;
  `;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.2s';
    setTimeout(() => toast.remove(), 200);
  }, 2000);
}

let lastCopiedText = '';

function computeDiff(currentText: string): string {
  if (!lastCopiedText) return currentText;

  const lastLines = lastCopiedText.split('\n');
  const currentLines = currentText.split('\n');

  // Search from the end of lastLines to find the best anchor point in currentLines.
  // Live captions may update earlier lines, so find the latest stable match.
  for (let i = lastLines.length - 1; i >= 0; i--) {
    const idx = currentLines.lastIndexOf(lastLines[i]);
    if (idx !== -1) {
      return currentLines.slice(idx + 1).join('\n');
    }
  }

  return currentText;
}

async function handleCopyCaptions(): Promise<{ success: boolean; message: string }> {
  const captions = getCaptions();

  if (captions.length === 0) {
    showToast('No captions found', true);
    return { success: false, message: 'No captions found' };
  }

  const text = formatCaptions(captions);
  const success = await copyToClipboard(text);

  if (success) {
    lastCopiedText = text;
    showToast('Copied to clipboard!');
    return { success: true, message: 'Copied!' };
  } else {
    showToast('Failed to copy', true);
    return { success: false, message: 'Failed to copy' };
  }
}

async function handleCopyDiff(): Promise<{ success: boolean; message: string }> {
  const captions = getCaptions();

  if (captions.length === 0) {
    showToast('No captions found', true);
    return { success: false, message: 'No captions found' };
  }

  const currentText = formatCaptions(captions);
  const diffText = computeDiff(currentText);

  if (!diffText) {
    showToast('No new captions', true);
    return { success: false, message: 'No new captions' };
  }

  const success = await copyToClipboard(diffText);

  if (success) {
    lastCopiedText = currentText;
    showToast('Copied diff to clipboard!');
    return { success: true, message: 'Copied diff!' };
  } else {
    showToast('Failed to copy', true);
    return { success: false, message: 'Failed to copy' };
  }
}

// Listen for messages from background script or popup
chrome.runtime.onMessage.addListener(
  (
    request: { action: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: { success: boolean; message: string; hasCopied?: boolean }) => void
  ) => {
    if (request.action === 'copy-captions') {
      handleCopyCaptions().then(sendResponse);
      return true;
    }
    if (request.action === 'copy-captions-diff') {
      handleCopyDiff().then(sendResponse);
      return true;
    }
    if (request.action === 'query-state') {
      sendResponse({ success: true, message: '', hasCopied: lastCopiedText !== '' });
      return false;
    }
  }
);
