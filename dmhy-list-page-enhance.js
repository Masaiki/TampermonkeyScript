// ==UserScript==
// @name         动漫花园列表页增强
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  列表页下载种子+批量复制种子/磁链链接
// @author       菜姬
// @match        *://dmhy.org/
// @match        *://dmhy.org/topics/list*
// @match        *://www.dmhy.org/
// @match        *://www.dmhy.org/topics/list*
// @match        *://share.dmhy.org/
// @match        *://share.dmhy.org/topics/list*
// @grant        GM_xmlhttpRequest
// @connect      dmhy.org
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    let changeToTorrentLink = localStorage.changeToTorrentLink === "true";
    function downloadTorrent(url, filename) {
        GM_xmlhttpRequest({
            method: "get",
            url: url,
            timeout: 5000,
            responseType: "arraybuffer",
            onload: function (r) {
                let blob = new Blob([r.response], { type: "application/octet-stream" });
                let anchor = document.createElement("a");
                anchor.href = URL.createObjectURL(blob);
                anchor.download = filename;
                anchor.style.display = "none";
                document.body.append(anchor);
                anchor.click();
                setTimeout(() => {
                    document.body.removeChild(anchor);
                    URL.revokeObjectURL(anchor.href);
                }, 0);
            }
        });
    }
    function reflush() {
        if (!changeToTorrentLink) {
            document.querySelectorAll('a.arrow-magnet').forEach((item, index, arr) => {
                item.onclick = null;
            });
        }
        else {
            document.querySelectorAll('a.arrow-magnet').forEach((item, index, arr) => {
                item.onclick = (e) => {
                    e.preventDefault();
                    let link = item.parentElement.previousElementSibling.querySelector("td>a");
                    GM_xmlhttpRequest({
                        method: "get",
                        url: link.href,
                        responseType: "text",
                        onload: function (r) {
                            let url, filename;
                            let html = r.response;
                            let match = html.match(/<a href="(.+?dl\.dmhy\.org\/[^"]+)">(.+?)<\/a>/);
                            url = match[1];
                            filename = match[2] + ".torrent";
                            downloadTorrent(url, filename);
                        }
                    });
                };
            });
        }
    }
    let block = document.querySelector('#topic_list > thead > tr > th:nth-child(4) > span');
    block.onclick = (e) => {
        changeToTorrentLink = !changeToTorrentLink;
        localStorage.changeToTorrentLink = changeToTorrentLink;
        e.target.textContent = changeToTorrentLink ? "種子" : "磁鏈";
        reflush();
    };
    reflush();
    block.textContent = changeToTorrentLink ? "種子" : "磁鏈";
    document.querySelector('#topic_list > thead > tr > th:nth-child(6) > span').textContent = "做種";
    let copyAllButton = document.createElement('a');
    copyAllButton.href = "javascript:;";
    copyAllButton.textContent = "複製全部";
    copyAllButton.onclick = (e) => {
        let text = [];
        let count = 0;
        document.querySelectorAll('a.arrow-magnet').forEach((item, index, arr) => {
            if (changeToTorrentLink) {
                let link = item.parentElement.previousElementSibling.querySelector("td>a");
                GM_xmlhttpRequest({
                    method: "get",
                    url: link.href,
                    timeout: 5000,
                    responseType: "text",
                    onload: function (r) {
                        let html = r.response;
                        let match = html.match(/<a href="(.+?dl\.dmhy\.org\/[^"]+)">(.+?)<\/a>/);
                        let url = match[1];
                        if (url.startsWith('//'))
                            url = 'https:' + url;
                        text.push(url);
                    }
                });
            }
            else {
                text.push(item.href);
            }
            count++;
        });
        let timer = setInterval(function () {
            if (count == text.length) {
                const textarea = document.createElement('textarea');
                document.body.appendChild(textarea);
                textarea.value = text.join('\n');
                textarea.select();
                if (document.execCommand('copy')) {
                    document.execCommand('copy');
                    alert('複製成功');
                }
                document.body.removeChild(textarea);
                clearInterval(timer);
                return;
            }
        }, 100);
    };
    document.querySelector('div.nav_title > div.fr').appendChild(copyAllButton);
})();