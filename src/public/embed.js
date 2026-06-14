/**
 * Referral Link Embed Widget
 *
 * Drop this script into your app and initialize with the current user's details.
 * It will fetch (or create) their referral link and render a small share widget.
 *
 * Usage:
 *   <script src="https://reflinkgen.com/embed.js"></script>
 *   <script>
 *     ReferralWidget.init({
 *       host: 'https://reflinkgen.com',  // where this server is running
 *       productId: 'my-saas-app',
 *       referrerEmail: currentUser.email,        // logged-in user's email
 *       container: '#referral-widget',           // CSS selector for mount point
 *     });
 *   </script>
 *
 * The widget shows the referral link, a copy button, and share shortcuts.
 */
(function (global) {
  'use strict';

  const ReferralWidget = {
    async init({ host, productId, referrerEmail, stripeCustomerId, container }) {
      const el = document.querySelector(container || '#referral-widget');
      if (!el) return console.warn('[ReferralWidget] container not found:', container);

      el.innerHTML = '<p style="color:#888;font-size:13px">Loading your referral link…</p>';

      try {
        const res = await fetch(`${host}/api/links`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, referrerEmail, stripeCustomerId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to generate link');
        this._render(el, data.url, host);
      } catch (err) {
        el.innerHTML = `<p style="color:#dc2626;font-size:13px">Could not load referral link: ${err.message}</p>`;
      }
    },

    _render(el, url, host) {
      el.innerHTML = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;border:1px solid #e5e5e5;border-radius:8px;padding:16px;max-width:480px;background:#fff">
          <p style="font-size:13px;font-weight:600;margin:0 0 8px">🔗 Share &amp; earn rewards</p>
          <p style="font-size:12px;color:#666;margin:0 0 12px">Invite friends — they get a discount, you earn credit.</p>
          <div style="display:flex;gap:8px;align-items:center;background:#f5f5ff;border:1px solid #e0e0ff;border-radius:6px;padding:8px 12px;margin-bottom:12px">
            <span id="_rw_url" style="flex:1;font-size:12px;color:#4f46e5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${url}</span>
            <button id="_rw_copy" onclick="ReferralWidget._copy('${url}', this)" style="flex-shrink:0;background:#6366f1;color:#fff;border:none;border-radius:5px;padding:5px 12px;font-size:12px;cursor:pointer">Copy</button>
          </div>
          <div style="display:flex;gap:8px">
            <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent('Try this — you\'ll love it')}" target="_blank" style="flex:1;text-align:center;background:#f0f0f0;border-radius:5px;padding:7px;font-size:12px;color:#333;text-decoration:none">Share on X</a>
            <a href="mailto:?subject=You%20should%20try%20this&body=${encodeURIComponent('Hey! I thought you might like this. Use my link: ' + url)}" style="flex:1;text-align:center;background:#f0f0f0;border-radius:5px;padding:7px;font-size:12px;color:#333;text-decoration:none">Share via Email</a>
          </div>
        </div>
      `;
    },

    _copy(url, btn) {
      navigator.clipboard.writeText(url).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => (btn.textContent = 'Copy'), 1500);
      });
    },
  };

  global.ReferralWidget = ReferralWidget;
})(window);
