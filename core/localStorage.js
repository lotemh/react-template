
function load(key, defaultValue) {
    const value = localStorage.getItem('elasticprogram-sdk.' + key);
    return (value === null ? defaultValue : value);
}

function save(key, value) {
    localStorage.setItem('elasticprogram-sdk.' + key, value);
}

export { load, save };
