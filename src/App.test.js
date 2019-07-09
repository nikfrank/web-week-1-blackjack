import React from 'react';
import ReactDOM from 'react-dom';
import App, { handValue, handValue1 } from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});


it('calculates the hand total correctly', ()=> {

});
