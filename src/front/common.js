export const href = id => {
  const { protocol, hostname } = window.location
  if (/hotel\./.test(hostname)) {
    const tld = hostname.split('.').slice(-1)[0]
    return `${protocol}//${id}.${tld}`
  } else {
    return `/${id}`
  }
}
