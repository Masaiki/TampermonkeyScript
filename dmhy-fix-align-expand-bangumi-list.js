// ==UserScript==
// @name         动漫花园去居中&新番列表展开
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://share.dmhy.org/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    document.querySelector("div[id$='_ad']").removeAttribute('align');
    let day = new Date().getDay();
    let f = document.querySelector('#mini_jmd');
    f.removeChild(document.querySelector('table.jmd'));
    let panel = document.querySelector('table.jmd_base');
    panel.className = 'jmd';
    panel.style.display = 'table';
    panel.tBodies[0].childNodes.forEach((item, index) => {
        if (index % 2) item.classList.add("odd");
        else item.classList.add("even");
        if (index == day) {
            item.classList.add('today');
        }
    });
})();