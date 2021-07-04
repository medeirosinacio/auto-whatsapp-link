// ID to manage the context menu entry
let cmid = [];
let language = window.navigator.userLanguage || window.navigator.language;

document.addEventListener('selectionchange', function () {

    let selection = window.getSelection().toString().trim();
    let selectionNumber = getNumber(selection);

    chrome.runtime.sendMessage({
        request: 'updateContextMenu',
        selection: selectionNumber
    });
});

chrome.runtime.onMessage.addListener(function (q, sender, sendResponse) {
    if (q.request === 'updateContextMenu') {

        let number = q.selection;

        if (cmid.length !== 0) {
            chrome.contextMenus.remove(cmid[0]);
        }
        cmid = [];

        if (number === '' || isInvalidPhone(number)) {
            return;
        }

        if (number.substring(0, 4) !== '0800' && number.substring(0, 1) !== '+') {
            number = msg('DDI') + number;
        }

        // Create new menu, and remember the ID
        cmid.push(chrome.contextMenus.create({
            title: msg('OPEN_IN'),
            contexts: ['selection']
        }));

        cmid.push(chrome.contextMenus.create({
            title: numberFormat(number),
            contexts: ["selection"],
            parentId: cmid[0],
            onclick: openWhats
        }));

    }
});

function getNumber(str) {

    let plus = '';
    if (str.substring(0, 1) === '+') {
        plus = '+';
    }

    return plus + str.replace(/\D/g, "");
}

function openWhats(number, tab) {

    chrome.tabs.create({
        url: "https://wa.me/" + getNumber(number.selectionText)
    });

}

function isInvalidPhone(phone) {
    if (phone.substring(0, 1) === '+') {
        return false;
    }

    const re = /^\d{10,11}$/gi;
    return !re.test(String(phone).toLowerCase());
}

function msg(type) {

    let msgl = {
        'OPEN_IN': {
            "pt-BR": 'Abrir numero no Whatsapp',
            "en-US": 'Open number in Whatsapp',
        },
        'DDI': {
            "pt-BR": '+55',
            "en-US": '+1',
        },
    }

    if (msgl[type][language] !== undefined) {
        return msgl[type][language];
    }

    return '';
}

function numberFormat(phoneNumberString) {

    String.prototype.insert_at = function (index, string) {
        return this.substr(0, index) + string + this.substr(index);
    }

    if (phoneNumberString.substring(0, 4) === '0800') {
        return phoneNumberString.insert_at(4, " ").insert_at(9, "-");
    }

    if (phoneNumberString.length === 14 || phoneNumberString.length === 13) {
        return phoneNumberString.insert_at(3, " (").insert_at(7, ") ").insert_at(14, "-");
    }

    return phoneNumberString
}
