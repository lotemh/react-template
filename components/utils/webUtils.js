
export function isIphone() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}
