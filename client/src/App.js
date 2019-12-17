import React, { useRef, useEffect } from 'react';
import { ControlledEditor } from '@monaco-editor/react';
import io from 'socket.io-client';

const target = `http://172.16.180.126:3030`;
const live = {};
const url = 'basiltoast';

function App() {
    const editorRef = useRef();
    const pendingEvent = useRef(false);
    const isBusy = useRef(false);

    const handleDidMount = (_, editor) => {
        editorRef.current = editor;
        editor.onDidChangeModelContent(handleEmit);
    };

    const handleEmit = (e, timeStamp) => {
        if (isBusy.current) return;
        if (!timeStamp) timeStamp = Date();
        if (pendingEvent.current) handleEmit(e, timeStamp);
        const { socket } = live;
        const change = e.changes[0];
        const operation = {
            rangeLength: change.rangeLength,
            rangeOffset: change.rangeOffset,
            text: change.text.replace(/\r\n/g, '\n'),
            timeStamp: timeStamp
        };
        socket.emit('change', operation);
    };

    useEffect(() => {
        live['socket'] = io(target);
        const { socket } = live;

        socket.on('connection', () => {
            socket.emit('join', url, '');
        });

        socket.on('initailize', data => {
            // initailize
        });

        socket.on('change', (socketId, op) => {
            if (socket.id === socketId) {
                setTimeout(() => {
                    pendingEvent.current = false;
                }, 10);
            } else {
                const rangeOffset = op.rangeOffset;
                const rangeLength = op.rangeLength;
                const text = op.text;

                const startPosition = editorRef.current
                    .getModel()
                    .getPositionAt(rangeOffset);
                const endPosition = editorRef.current
                    .getModel()
                    .getPositionAt(rangeOffset + rangeLength);
                isBusy.current = true;
                editorRef.current.executeEdits(socketId, [
                    {
                        range: {
                            startLineNumber: startPosition.lineNumber,
                            startColumn: startPosition.column,
                            endLineNumber: endPosition.lineNumber,
                            endColumn: endPosition.column
                        },
                        text,
                        forceMoveMarkers: true
                    }
                ]);
                isBusy.current = false;
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
