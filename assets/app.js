(function () {
  const client = ZAFClient.init();
  let settings = { mode: 'force_public', autofixType: false, minLength: 0 };

  client.metadata().then(meta => {
    settings = Object.assign(settings, meta && meta.settings ? meta.settings : {});
    if (typeof settings.minLength === 'string') {
      const n = parseInt(settings.minLength, 10);
      settings.minLength = isNaN(n) ? 0 : n;
    }
  });

  // Live hints (sticky so they don't disappear immediately)
  client.on('comment.type.changed', updateHint);
  client.on('comment.text.changed', updateHint);
  client.on('ticket.status.changed', updateHint);

  async function updateHint() {
    try {
      const data = await client.get(['ticket.status', 'ticket.comment.type', 'ticket.comment.text']);
      const status = data['ticket.status'];
      const type = data['ticket.comment.type'];
      const text = (data['ticket.comment.text'] || '').trim();
      if (status === 'solved') return;

      const rules = requiredRule();
      // We avoid spamming; show one most-relevant sticky hint at a time.
      if (rules.requireText && !text) {
        client.invoke('notify', 'A comment is required before saving this non-Solved ticket.', 'alert', 8000, { sticky: true });
        return;
      }
      if (rules.minLength && text.length > 0 && text.length < rules.minLength) {
        client.invoke('notify', `Comment must be at least ${rules.minLength} characters.`, 'alert', 8000, { sticky: true });
        return;
      }
      if (rules.requiredType && type !== rules.requiredType) {
        client.invoke('notify', `This ticket requires a ${humanType(rules.requiredType)}.`, 'alert', 8000, { sticky: true });
        return;
      }
    } catch (e) { /* ignore */ }
  }

  // Hard enforcement — IMPORTANT: in async handlers, REJECT to block
  client.on('ticket.save', async () => {
    const data = await client.get(['ticket.status', 'ticket.comment.type', 'ticket.comment.text']);
    const status = data['ticket.status'];
    let type = data['ticket.comment.type'];
    const text = (data['ticket.comment.text'] || '').trim();

    if (status === 'solved') return true;

    const rules = requiredRule();

    if (rules.requireText && !text) {
      return Promise.reject("Please add a comment before saving this non-Solved ticket.");
    }
    if (rules.minLength && text.length < rules.minLength) {
      return Promise.reject(`Please enter at least ${rules.minLength} characters before saving.`);
    }
    if (rules.requiredType && type !== rules.requiredType) {
      if (settings.autofixType) {
        try {
          await client.set('ticket.comment.type', rules.requiredType);
          type = rules.requiredType;
        } catch (e) { /* fall through to block */ }
      }
      if (type !== rules.requiredType) {
        return Promise.reject(`This ticket requires a ${humanType(rules.requiredType)} before saving.`);
      }
    }

    return true;
  });

  function requiredRule() {
    const rule = { requireText: false, requiredType: null, minLength: 0 };
    rule.minLength = typeof settings.minLength === 'number' && settings.minLength > 0 ? settings.minLength : 0;

    switch ((settings.mode || '').trim()) {
      case 'require_any':
        rule.requireText = true;
        break;
      case 'force_public':
        rule.requireText = true;
        rule.requiredType = 'publicReply';
        break;
      case 'force_private':
        rule.requireText = true;
        rule.requiredType = 'internalNote';
        break;
      default:
        rule.requireText = true;
    }
    return rule;
  }

  function humanType(t) {
    return t === 'publicReply' ? 'Public reply' : 'Private note';
  }
})();
