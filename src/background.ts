chrome.commands.onCommand.addListener((command: string) => {
  if (command === 'copy-captions') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id && tab.url?.includes('meet.google.com')) {
        chrome.tabs.sendMessage(tab.id, { action: 'copy-captions' });
      }
    });
  }
});
