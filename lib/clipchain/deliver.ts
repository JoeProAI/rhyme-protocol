/**
 * Email delivery for finished films via Resend's REST API (no SDK dep).
 * Best-effort: a missing key or a bounce never blocks delivery — the film
 * is already in the user's library and at its hosted URL regardless.
 */

const FROM = process.env.CLIPCHAIN_FROM_EMAIL || 'Rhyme Protocol <clips@rhymeprotocol.com>'

export async function emailClip(
  to: string,
  title: string,
  videoUrl: string,
  seconds: number
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('[clipchain] RESEND_API_KEY not set — skipping delivery email')
    return false
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: `Your film is ready — ${title}`,
        text: [
          `${title} (${seconds}s) finished rendering.`,
          '',
          `Watch and download: ${videoUrl}`,
          '',
          'It is also saved in your clips at rhymeprotocol.com/studio/clips',
          'from this same browser session.',
          '',
          'Rhyme Protocol',
        ].join('\n'),
        html: [
          '<div style="font-family:monospace;max-width:520px;margin:0 auto;padding:24px;color:#111">',
          '<div style="letter-spacing:0.3em;font-size:11px;color:#a16207">RHYME_PROTOCOL / CLIP_CHAIN</div>',
          `<h1 style="font-size:20px;margin:16px 0 4px">${escapeHtml(title)}</h1>`,
          `<p style="font-size:13px;color:#555;margin:0 0 20px">${seconds}s film, finished rendering.</p>`,
          `<a href="${videoUrl}" style="display:inline-block;background:#C9A227;color:#000;font-weight:bold;font-size:13px;padding:12px 20px;text-decoration:none;border-radius:8px">WATCH AND DOWNLOAD</a>`,
          '<p style="font-size:12px;color:#777;margin-top:20px">Also saved in <a href="https://rhymeprotocol.com/studio/clips" style="color:#a16207">your clips</a> from this browser session.</p>',
          '</div>',
        ].join(''),
      }),
    })
    if (!res.ok) {
      console.warn('[clipchain] delivery email failed:', res.status, (await res.text()).slice(0, 200))
      return false
    }
    return true
  } catch (err) {
    console.warn('[clipchain] delivery email error:', err)
    return false
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
