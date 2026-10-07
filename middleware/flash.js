function flashMessages(req, res, next) {
  let messages = {};
  try {
    const parsed = JSON.parse(req.cookies.notice || '{}');
    for (const type of ['success', 'error']) {
      if (Array.isArray(parsed[type])) {
        messages[type] = parsed[type].filter((message) => typeof message === 'string')
          .slice(0, 3).map((message) => message.slice(0, 300));
      }
    }
  } catch {}

  if (req.cookies.notice) res.clearCookie('notice', { path: '/' });
  req.flash = (type, message) => {
    if (!type) {
      const current = messages;
      messages = {};
      return current;
    }
    if (!['success', 'error'].includes(type)) return [];
    if (message !== undefined) {
      messages[type] = [String(message).slice(0, 300)];
      res.cookie('notice', JSON.stringify(messages), {
        httpOnly: true,
        secure: req.secure || process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 1000
      });
    }
    return messages[type] || [];
  };
  next();
}

module.exports = flashMessages;
