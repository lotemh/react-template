
export function isIphone() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

export function isMobileAgent() {
    return isIphone() || (/Android/i.test(navigator.userAgent) && !window.MSStream)
}

export function isSafari() {
    var patt = new RegExp(/^((?!chrome|android).)*safari/i);
    return patt.test(navigator.userAgent);
}

