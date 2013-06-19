function openLink(url) {
    chrome.tabs.create({url: url});
}

function appendDomainAndOpen(url) {
    chrome.tabs.getSelected(null, function(tab) {
        var domain = tab.url;
        domain = domain.match(/^http[s]?:\/\/.*?([a-z\-0-9]+\.[a-z\-0-9]+)\/.*?$/i);
        chrome.tabs.create({url: url+domain[1]});
    });
}

function initialize() {
    if(document.body.addEventListener) {
        document.body.addEventListener('click', clickHandler, false);
    }

    function clickHandler(e) {
        e = e || window.event;
        var target = e.target || e.srcElement;
        if(target.className.match(/link/)) {
            openLink(target.href);
        } else if(target.className.match(/appenddomain/)) {
            appendDomainAndOpen(target.href);
        }
    }
}

window.addEventListener('load', initialize);
