import React, { useState, useRef, useEffect } from 'react';
import { ControlledEditor } from '@monaco-editor/react';
import io from 'socket.io-client';
import { Operation, merge } from './ot';

const target = `http://127.0.0.1:3030`;
const live = {};
const url = 'basiltoast';

function App() {
    const [code, setCode] = useState('');
    const [value, setValue] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const monacoRef = useRef();
    const codeRef = useRef('');

    const handleInit = () => {
        live.socket = io(target);
        const { socket } = live;
        socket.on('connection', id => {
            live.id = id;
            socket.emit('join', url, code);
        });
        socket.on('initailize', initailData => {
            setIsBusy(true);
            setCode(initailData);
        });
        socket.on('change', (id, op) => {
            if (id === socket.id) {
                return setTimeout(setIsPending(false), 0);
            }
            setIsBusy(true);

            const selection = monacoRef.current.getSelection();
            // console.log(selection);
            // const model = monacoRef.current.getModel();
            // console.log(model.getValueInRange(
            //     {
            //         ...position,
            //         selectionStartColumn: 1,
            //         selectionStartLineNumber: 1
            // }));
            setCode(merge(op, codeRef.current));
            monacoRef.current.setSelection(selection);
        });
    };

    const handleOnChange = (_, value) => {
        setValue(value);
    };

    const handleDidMount = (_, editor) => {
        monacoRef.current = editor;
    };

    useEffect(() => {
        if (code === value) return;
        if (isPending || isBusy) return;
        if (!live.socket) return;
        live.socket.emit('change', new Operation(code, value));
        setIsBusy(true);
        setCode(value);
        setIsPending(true);
    }, [code, value, isPending, isBusy]);

    useEffect(() => {
        if (code !== value) setIsBusy(false);
    }, [code, value]);

    useEffect(() => {
        codeRef.current = code;
    }, [code]);

    useEffect(handleInit, []);

    return (
        <>
            <ControlledEditor
                height="100vh"
                width="100vw"
                theme="vs-dark"
                language="javascript"
                value={code}
                editorDidMount={handleDidMount}
                onChange={handleOnChange}
            />
        </>
    );
}

export default App;
