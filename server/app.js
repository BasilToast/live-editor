const io = require('socket.io')();
const { Operation, transform, merge } = require('./ot');

const port = 3030;

const data = {};

io.on('connection', socket => {
    // handshake
    socket.emit('connection', socket.id);
    socket.on('join', (url, initailData) => {
        if (!data[url]) {
            data[url] = {};
            data[url]['content'] = initailData;
            data[url]['history'] = [];
            data[url]['history'].push({
                rangeLength: 0,
                rangeOffset: 0,
                text: '',
                timeStamp: Date()
            });
        }
        socket.join(url);
        console.log(`${socket.id} is joined ${url}`);
        socket.emit('initailize', data[url]['content']);
    });

    // change event calculate operation
    socket.on('change', op => {
        const { history, content } = data['basiltoast'];
        // history.forEach(oldOp => {
        //     op = transform(op, oldOp);
        // });

        // history.push(op);
        data['basiltoast']['content'] = merge(op, content);
        io.in('basiltoast').emit('change', socket.id, op);
    });

    socket.on('moveCursor', position => {
        socket.broadcast.emit('moveCursor', socket.id, position);
    });
});

io.listen(port);
