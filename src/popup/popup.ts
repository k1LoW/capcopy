const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;

function showStatus(message: string, isError = false): void {
  statusDiv.textContent = message;
  statusDiv.className = `status ${isError ? 'error' : 'success'}`;
  setTimeout(() => {
    statusDiv.textContent = '';
    statusDiv.className = 'status';
  }, 2000);
}

copyBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id || !tab.url?.includes('meet.google.com')) {
    showStatus('Not on Google Meet', true);
    return;
  }

  copyBtn.disabled = true;

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'copy-captions' });
    if (response?.success) {
      showStatus(response.message);
    } else {
      showStatus(response?.message || 'Failed to copy', true);
    }
  } catch {
    showStatus('Failed to copy', true);
  } finally {
    copyBtn.disabled = false;
  }
});
