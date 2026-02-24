import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { Sells } from './pages/Sells';
import { Analytics } from './pages/Analytics';


const App: React.FC = () => {
  return (<>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/products' element={<Products loadUnit={3}/>}/>
      <Route path='/sells' element={<Sells loadUnit={3}/>}/>
      <Route path='/analytics' element={<Analytics/>}/>
    </Routes>
  </>);
};

export default App;