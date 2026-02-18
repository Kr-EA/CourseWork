import React, { useEffect } from 'react';
import { TableView } from './components/TableView';

const App: React.FC = () => {

  return (<>
    <TableView loadUnit={2} hint='product'/>
    <TableView loadUnit={1} hint='sell'/>
  </>);
};

export default App;