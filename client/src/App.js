import React, { useRef, useEffect } from 'react';
import { ControlledEditor } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import io from 'socket.io-client';
import _ from 'lodash';

const target = `http://localhost:3030`;
const live = {};
const user = {};
const url = 'basiltoast';

class createCursorWidget {
    constructor(editor, id, position) {
        this.editor = editor;
        this.id = id;
        this.domNode = null;
        this.position = position;
    }

    getId() {
        return this.id;
    }

    getDomNode() {
        if (!this.domNode) {
            this.domNode = document.createElement('div');
            this.domNode.innerHTML = 'user';
            this.domNode.style.background = 'grey';
            this.domNode.id = this.id;
        }
        return this.domNode;
    }

    getPosition() {
        return {
            position: this.position,
            preference: [monaco.editor.ContentWidgetPositionPreference.EXACT]
        };
    }
    updatePosition(position) {
        this.position = position;
        this.editor.layoutContentWidget(this);
    }
}

function App() {
    const editorRef = useRef();
    const pendingEvent = useRef(false);
    const isBusy = useRef(false);

    const handleDidMount = (_, editor) => {
        editorRef.current = editor;
        editor.onDidChangeModelContent(handleEmit);
        editor.onDidChangeCursorPosition(handleCursor);
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

    const handleCursor = _.throttle(e => {
        const { socket } = live;
        socket.emit('moveCursor', e.position);
    }, 200);

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

        socket.on('moveCursor', (socketId, position) => {
            if (!user[socketId]) {
                const widget = new createCursorWidget(
                    editorRef.current,
                    socketId,
                    position
                );
                user[socketId] = widget;
                editorRef.current.addContentWidget(widget);
                return;
            }
            user[socketId].updatePosition(position);
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
