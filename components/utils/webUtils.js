
export function isIphone() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

export function isMobileAgent() {
    return isIphone() || (/Android/i.test(navigator.userAgent) && !window.MSStream)
}
