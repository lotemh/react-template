console.log("loading big file");
newScript = document.createElement('script');
newScript.type = 'text/javascript';
newScript.src = 'http://cdn-dev.elasticmedia.io/sdk-test/fullPlugin.js';
document.getElementsByTagName('head')[0].appendChild(newScript);
