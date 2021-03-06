function updateStyles() {
  // Handles live update from color picker
  chrome.runtime.onMessage.addListener(
    (request, sender) => {
      if (!sender.tab) {
        if (request.update === 'style') {
          const property = request.property;
          const el = document.querySelectorAll(request.selector);
          const color = request.color;
          let rgba;

          if (color) {
            rgba = `rgba(${color.r},${color.g},${color.b},${color.a})`;
          }

          el.forEach(target => {
            const element = target;
            if (request.color) {
              element.style[property] = rgba;
            } else {
              element.removeAttribute('style');
              location.reload();
            }
          });
        }
      }
    }
  );
}

function updateDisplay() {
  chrome.runtime.onMessage.addListener(
    (request, sender) => {
      if (!sender.tab) {
        if (request.update === 'display') {
          const el = document.querySelectorAll(request.selector);
          try {
            el.forEach(target => {
              const element = target;
              if (!request.display) {
                element.style.display = 'none';
              } else {
                element.style.display = 'block';
              }
            });
          } catch (e) {
            throw e;
          }
        }
      }
    }
  );
}

function reloadPage() {
  chrome.runtime.onMessage.addListener(
    (request, sender) => {
      if (!sender.tab) {
        if (request.update === 'reload') {
          location.reload();
        }
      }
    }
  );
}

function sendNotification(total, cb) {
  return chrome.runtime.sendMessage({
    badge: total
  }, cb);
}

function getNotifications() {
  // Set a delay for getting notifcations
  setTimeout(() => {
    const el = document.querySelectorAll('span[data-notifications]');
    const nodes = [...el].splice(0, 3);
    let total = 0;
    nodes.map(target => {
      const value = parseInt(target.dataset.notifications, 10);
      total += value;
      return total;
    });
    return sendNotification(total, getNotifications);
  }, 60000);
}

window.addEventListener('load', () => {
  updateStyles();
  updateDisplay();
  reloadPage();

  /**
   * Set a delay whilst we wait for current page to compute all DOM
   * elements that have notification attributes bound to them
   */
  setTimeout(getNotifications, 1000);
});

window.addEventListener('message', (event) => {
  // We only accept messages from ourselves
  if (event.source !== window) {
    return;
  }

  if (event.data.username) {
    chrome.storage.sync.set({ user: event.data });
  }
}, false);
