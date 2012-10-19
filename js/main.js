var notification = new Notification('html/notification.html', 1000 * 60 * 5);

function createWs() {
    var ws = new WebSocket('ws://172.28.84.31:8081/jenkins');

    ws.onmessage = function(message) {
        try {
            var job = JSON.parse(message.data);

            var ctx = {
                url: 'http://172.28.84.31:8080/' +
                'view/%E3%81%99%E3%81%B9%E3%81%A6/job/' +
                    job.project + '/' + job.number + '/',
                project: job.project,
                isDev:  job.project.indexOf('dev.') >= 0,
                time: new Date(message.timeStamp + 1000 * 60 * 60 * 9)
                        .toISOString().replace('T', ' ').replace(/\..+$/, ''),
            };

            if (job.result !== 'SUCCESS') {
                ctx.ok = false;
                ctx.message = 'NG';
                notification.open(ctx);
            } else {
                ctx.ok = true;
                ctx.message = 'OK';
                notification.open(ctx, 1000 * 5);
            }
        } catch(e) {
            alert(e);
        }
    };

    ws.onerror = function(err) {
        console.log(err);
    };

    ws.onclose = function() {
        console.log('reconnect!');
        setTimeout(function() {
            ws = createWs();
        }, 30000);
    };

    return ws;
}

var ws = createWs();

// notification.html
chrome.extension.onRequest.addListener(function(message, sender, sendResponse){
    sendResponse(notification.getItem(message.id));
});
