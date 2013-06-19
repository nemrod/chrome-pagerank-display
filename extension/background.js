function makehash(u) {
	var zF = function(a, b) {
		var z = parseInt(80000000, 16);
		if(z & a) {
			a = a >> 1;
			a &= ~z;
			a |= 0x40000000;
			a = a >> (b - 1);
		} else
			a = a >> b;
		return a;
	}, mix = function(a, b, c) {
		a -= b; a -= c; a ^= (zF(c, 13));
		b -= c; b -= a; b ^= (a << 8);
		c -= a; c -= b; c ^= (zF(b, 13));
		a -= b; a -= c; a ^= (zF(c, 12));
		b -= c; b -= a; b ^= (a << 16);
		c -= a; c -= b; c ^= (zF(b, 5));
		a -= b; a -= c; a ^= (zF(c, 3));
		b -= c; b -= a; b ^= (a<<10);
		c -= a; c -= b; c ^= (zF(b, 15));
		return new Array((a), (b), (c));
	}, GoogleCH = function(url) {
		length = url.length;
		var a = 0x9E3779B9, b = 0x9E3779B9, c = 0xE6359A60, k = 0,len = length, mx = new Array();
		while(len >= 12) {
			a += (url[k+0] + (url[k+1] << 8) + (url[k+2] << 16) + (url[k+3] << 24));
			b += (url[k+4] + (url[k+5] << 8) + (url[k+6] << 16) + (url[k+7] << 24));
			c += (url[k+8] + (url[k+9] << 8) + (url[k+10] << 16) + (url[k+11] << 24));
			mx = mix(a, b, c);
			a = mx[0];
			b = mx[1];
			c = mx[2];
			k += 12;
			len -= 12;
		}
		c += length;
		switch(len) {
			case 11: c += url[k+10] << 24;
			case 10: c += url[k+9] << 16;
			case 9: c += url[k+8] << 8;
			case 8: b += url[k+7] << 24;
			case 7: b += url[k+6] << 16;
			case 6: b += url[k+5] << 8;
			case 5: b += url[k+4];
			case 4: a += url[k+3] << 24;
			case 3: a += url[k+2] << 16;
			case 2: a += url[k+1] << 8;
			case 1: a += url[k];
		}
		mx = mix(a, b, c);
		return mx[2] < 0 ? 0x100000000 + mx[2] : mx[2];
	}, strord = function(string) {
		var result = new Array();
		for(i = 0; i < string.length; i++)
			result[i] = string[i].charCodeAt(0);
		return result;
	};
	return GoogleCH(strord('info:'+u));
}

function getPR(url) {
	url = 'http://toolbarqueries.google.com/tbr?client=navclient-auto&features=Rank&ch=6' + makehash(url) + '&q=info:' + url;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, false);
	xhr.send(null);
	return xhr.responseText.substr(9, 2).replace(/\s$/,'');
}

function showPR(url, tabId) {
	console.log('url:'+url+', tabId:'+tabId);
	if(url != undefined) {
		var domain = url.match(/^(http|https):\/\/([\w.]+)(:\d+)?/);
		if(domain != null) {
			var value = getPR(url);
			if(value == '' || isNaN(value * 1)) {
				url = domain[2];
				value = getPR(url);
				value = value == '' || isNaN(value * 1) ? '?' : value + 'h';
			}
			updatePR(value, url, tabId);
		} else
			updatePR('?', url, tabId);
	}
}

function updatePR(value, url, tabId) {
	chrome.browserAction.setBadgeText({text: value, 'tabId': tabId});
	chrome.browserAction.setBadgeBackgroundColor({color: value == '?' ? [190, 190, 190, 230] : [208, 0, 24, 255], 'tabId': tabId});
	chrome.browserAction.setTitle({title: value == '?' ? 'Page has no PR' : url + ' has PR ' + value, 'tabId': tabId});
	chrome.browserAction.setIcon({path: value == '?' ? 'img/0.png' : 'img/' + parseInt(value) + '.png', 'tabId': tabId});
}

chrome.browserAction.setBadgeBackgroundColor({color: [190, 190, 190, 230]});
chrome.browserAction.setBadgeText({text: '?'});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo) {
	showPR(changeInfo.url, tabId);
});
