import React from 'react';
import MainPage from './components/MainPage';
import { Routes, Route } from 'react-router-dom';

const App = () => {
  return (      
      <div>
        <Routes>
           <Route path="/" element={<MainPage/>} />
        </Routes>
      </div>
  );
};

export default App;