import React, { useRef, useEffect } from 'react';
import { ControlledEditor } from '@monaco-editor/react';
import io from 'socket.io-client';
import { Operation, merge } from './ot';
import _ from 'lodash';

const target = `http://125.142.133.130:3030`;
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

    const handleEmit = (e, timeStamp) => {
        if(e.changes[0].forceMoveMarkers) return;
        if(!timeStamp) timeStamp = Date();
        if(pendingEvent.current) handleEmit(e, timeStamp);
        const {socket} = live;
        const change = e.changes[0];
        const operation = {
            rangeLength: change.rangeLength,
            rangeOffset: change.rangeOffset,
            text: change.text.replace(/\r\n/g, '\n'),
            timeStamp: timeStamp
        }
        socket.emit('change', operation);
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
                setTimeout(() => {
                    pendingEvent.current = false;
                }, 10);
            } else {
                console.log(op);
                const rangeOffset = op.rangeOffset;
                const rangeLength = op.rangeLength;
                const text = op.text;

                const startPosition = editorRef.current.getModel().getPositionAt(rangeOffset);
                const endPosition = editorRef.current.getModel().getPositionAt(rangeOffset + rangeLength);
                editorRef.current.executeEdits(socketId, [{
                    range: {
                        startLineNumber: startPosition.lineNumber,
                        startColumn: startPosition.column,
                        endLineNumber: endPosition.lineNumber,
                        endColumn: endPosition.column
                    },
                    text,
                    forceMoveMarkers: true
                }]);
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
