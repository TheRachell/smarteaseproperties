/*
  SmartEase CMS content loader.
  Every page that has editable content sets data-cms-page="<path under /content/>"
  on <body> (e.g. data-cms-page="index" -> /content/index.json,
  data-cms-page="properties/metroluxe" -> /content/properties/metroluxe.json).

  Elements to be filled in are marked with data-cms="<dot.path>" pointing at a
  key inside that JSON file. Array items are addressed by index, e.g.
  data-cms="pricing.0.price". <img> tags get their src set; everything else
  gets its text content set.

  The HTML already contains the current content as static fallback text, so
  if this script fails to load (offline, JSON missing, JS disabled) the page
  still reads correctly — this only refreshes it with the latest edits from
  the CMS.
*/
(function () {
  function getPath(obj, path) {
    return path.split('.').reduce(function (acc, key) {
      if (acc == null) return undefined;
      return acc[key];
    }, obj);
  }

  function applyValue(el, value) {
    if (value == null) return;
    var tag = el.tagName;
    if (tag === 'IMG') {
      el.setAttribute('src', value);
    } else if (tag === 'A' && el.hasAttribute('data-cms-href')) {
      el.setAttribute('href', value);
    } else {
      el.textContent = value;
    }
  }

  function hydrate(root) {
    var page = root.body.getAttribute('data-cms-page');
    if (!page) return;
    var url = '/content/' + page + '.json';
    fetch(url, { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data) return;
        var nodes = root.querySelectorAll('[data-cms]');
        nodes.forEach(function (el) {
          var key = el.getAttribute('data-cms');
          var value = getPath(data, key);
          applyValue(el, value);
        });
      })
      .catch(function () {
        /* Network/JSON error: static fallback content already in the page stays as-is. */
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { hydrate(document); });
  } else {
    hydrate(document);
  }
})();
