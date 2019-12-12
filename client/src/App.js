import React from 'react';
import { ControlledEditor } from '@monaco-editor/react';

function App() {
    return (
        <>
            <ControlledEditor
                height="100vh"
                width="100vw"
                theme="vs-dark"
                language="javascript"
            />
        </>
    );
}

export default App;
