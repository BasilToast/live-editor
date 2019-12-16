import React, { useRef, useEffect } from 'react';
import { ControlledEditor } from '@monaco-editor/react';
import io from 'socket.io-client';
import { Operation, merge } from './ot';

const target = `http://172.16.180.126:3030`;
const live = {};
const url = 'basiltoast';

function App() {
    const editorRef = useRef();
    const originCodeRef = useRef('');
    const modifyCodeRef = useRef('');
    const pendingEvent = useRef(false);

    const handleDidMount = (_, editor) => {
        editorRef.current = editor;

        editor.onDidChangeModelContent(handleEmit);
    };

    const handleEmit = () => {
        modifyCodeRef.current = editorRef.current.getValue();
        if (originCodeRef.current === modifyCodeRef.current) return;
        setTimeout(handleEmit);
        if (pendingEvent.current) return;

        pendingEvent.current = true;
        const { socket } = live;
        socket.emit(
            'change',
            new Operation(originCodeRef.current, modifyCodeRef.current)
        );
    };

    useEffect(() => {
        live['socket'] = io(target);
        const { socket } = live;

        socket.on('connection', () => {
            socket.emit('join', url, '');
        });

        socket.on('initailize', data => {
            originCodeRef.current = data;
            modifyCodeRef.current = data;
        });

        socket.on('change', (socketId, op) => {
            if (socket.id === socketId) {
                pendingEvent.current = false;
                originCodeRef.current = merge(op, originCodeRef.current);
            } else {
                originCodeRef.current = merge(op, originCodeRef.current);
                modifyCodeRef.current = merge(op, modifyCodeRef.current);
                const position = editorRef.current.getPosition();
                const opBase = op[0].value;

                let positionOffset = editorRef.current
                    .getModel()
                    .getOffsetAt(position);

                let opOffset = 0;
                op.forEach(o => {
                    switch (o.state) {
                        case 'insert':
                            opOffset += o.value.length;
                            break;
                        case 'delete':
                            opOffset -= o.value;
                            break;
                        default:
                            break;
                    }
                });
                if (opBase < positionOffset) positionOffset += opOffset;

                editorRef.current.setValue(modifyCodeRef.current);
                const newPosition = editorRef.current
                    .getModel()
                    .getPositionAt(positionOffset);

                editorRef.current.setPosition(newPosition);
            }
        });
    }, []);

    return (
        <>
            <ControlledEditor
                height="100vh"
                width="100vw"
                theme="vs-dark"
                language="javascript"
                editorDidMount={handleDidMount}
            />
        </>
    );
}

export default App;
