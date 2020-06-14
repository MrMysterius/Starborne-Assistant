// Websocket Server Connection
var ws = new WebSocket('ws://localhost:22277', 'echo-protocol');

// Functions for Display Changes on site
function toggle(btn_id, text_id, headertext) {
    let btn = document.getElementById(btn_id);
    let text = document.getElementById(text_id);
    
    if (text.classList.toString().includes('invis')) {
        btn.innerHTML = "| <b>" + headertext + "</b> |";
        btn.classList = "center pointer";
        text.classList = "left disp";
    } else {
        btn.innerHTML = ">>> <b>" + headertext + "</b> <<<";
        btn.classList = "center pointer slow-blink";
        text.classList = "left invis";
    }
}

function toggle_install() {   
    toggle('install-btn', 'install-text', 'INSTALLATION');
}

function toggle_use() {
    toggle('use-btn', 'use-text', 'USAGE');
}

function toggle_commands() {
    toggle('command-btn', 'command-text', 'COMMANDS');
}

function back() {
    let wrapper = document.getElementById('wrapper');
    let front = document.getElementById('front');
    let code = document.getElementById('code');
    let change = document.getElementById('change');
    let share_code = document.getElementById('share-code');

    wrapper.classList = 'front';
    front.classList = 'disp';
    code.classList = 'invis';
    change.classList = 'invis';
    share_code.innerHTML = '- - - - - -';
}

function show_change() {
    let wrapper = document.getElementById('wrapper');
    let front = document.getElementById('front');
    let code = document.getElementById('code');
    let change = document.getElementById('change');

    wrapper.classList = 'change';
    front.classList = 'invis';
    code.classList = 'invis';
    change.classList = 'disp';
}

//Functions for sending / receiving Data
function send() {
    let wrapper = document.getElementById('wrapper');
    let front = document.getElementById('front');
    let code = document.getElementById('code');
    let change = document.getElementById('change');

    wrapper.classList = 'code';
    front.classList = 'invis';
    code.classList = 'disp';
    change.classList = 'invis';
    
    let data = document.getElementById('send-data').value;
    ws.send(data);
}

function copy() {
    var node = 'share-code'
    node = document.getElementById(node);
    if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
    document.execCommand('copy')
    setTimeout(function() {
        window.getSelection().removeAllRanges();
    },1);
}

window.addEventListener('load', function () {

    let textarea = document.getElementById('send-data');
    let send_btn = document.getElementById('send-btn');

    textarea.removeAttribute('disabled');
    send_btn.removeAttribute('disabled');

    let url = new URL(window.location.href);
    if (url.hash === '#changelog') {
        show_change();
        window.history.replaceState({}, document.title, "/random/spyreports");
    }

    textarea.addEventListener('paste', function() {
        setTimeout(send, 200);
    }, true);
});


ws.addEventListener('message', (package) => {
    let msg = package.data;
    document.getElementById('share-code').innerHTML = msg;
    copy();
})

ws.addEventListener('error', () => {
    let error = document.getElementById('error');
    let textarea = document.getElementById('send-data');
    let send_btn = document.getElementById('send-btn');

    error.classList = 'slow-blink';
    textarea.setAttribute('disabled', '');
    textarea.classList += 'error';
    send_btn.setAttribute('disabled', '');
    send_btn.classList += 'error';
});