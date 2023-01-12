// Saves options to chrome.storage
function save_options() {
  let mode = document.getElementById('mode').value;
  chrome.storage.sync.set({
    previousMode: mode
  }, function() {
    // Update status to let user know options were saved.
    let status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
  (async () => {
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    const response = await chrome.tabs.sendMessage(tab.id, {greeting: "hello"});
    // do something with response here, not outside the function
    console.log(response);
  })();
}


// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    previousMode: 'neither',
  }, function(items) {
    document.getElementById('mode').value = items.previousMode;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
