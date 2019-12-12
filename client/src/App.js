import React, { useState, useRef, useEffect } from 'react';
import { ControlledEditor } from '@monaco-editor/react';
import io from 'socket.io-client';
import { Operation, merge } from './ot';

const target = `http://localhost:3030`;
const live = {};
const url = 'basiltoast';

function App() {
    const [code, setCode] = useState('');
    const [value, setValue] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const monaco = useRef();
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
            setCode(merge(op, codeRef.current));
        });
    };

    const handleOnChage = (_, value) => {
        setValue(value);
    };

    const handleDidMount = (_, editor) => {
        monaco.current = editor;
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
                onChange={handleOnChage}
            />
        </>
    );
}

export default App;
