import { motion } from 'framer-motion';
import React from 'react';
import './App.css';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <motion.h1 animate={{ scale: 1.5 }}>
                    Welcome to Divinity-RPS
                </motion.h1>
            </header>
        </div>
    );
}

export default App;