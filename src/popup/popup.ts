const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
const copyDiffBtn = document.getElementById('copy-diff-btn') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;

function showStatus(message: string, isError = false): void {
  statusDiv.textContent = message;
  statusDiv.className = `status ${isError ? 'error' : 'success'}`;
  setTimeout(() => {
    statusDiv.textContent = '';
    statusDiv.className = 'status';
  }, 2000);
}

function showDiffButton(): void {
  copyDiffBtn.style.display = 'block';
}

async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url?.includes('meet.google.com')) {
    return null;
  }
  return tab;
}

// Check if a copy has already been done on this page
async function checkState(): Promise<void> {
  const tab = await getActiveTab();
  if (!tab?.id) return;

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'query-state' });
    if (response?.hasCopied) {
      showDiffButton();
    }
  } catch {
    // Content script not ready yet
  }
}

copyBtn.addEventListener('click', async () => {
  const tab = await getActiveTab();
  if (!tab?.id) {
    showStatus('Not on Google Meet', true);
    return;
  }

  copyBtn.disabled = true;

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'copy-captions' });
    if (response?.success) {
      showStatus(response.message);
      showDiffButton();
    } else {
      showStatus(response?.message || 'Failed to copy', true);
    }
  } catch {
    showStatus('Failed to copy', true);
  } finally {
    copyBtn.disabled = false;
  }
});

copyDiffBtn.addEventListener('click', async () => {
  const tab = await getActiveTab();
  if (!tab?.id) {
    showStatus('Not on Google Meet', true);
    return;
  }

  copyDiffBtn.disabled = true;

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'copy-captions-diff' });
    if (response?.success) {
      showStatus(response.message);
    } else {
      showStatus(response?.message || 'Failed to copy', true);
    }
  } catch {
    showStatus('Failed to copy', true);
  } finally {
    copyDiffBtn.disabled = false;
  }
});

checkState();
