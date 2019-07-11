import React from 'react';
import ReactDOM from 'react-dom';
import App, { handValue, handValue1 } from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});


it('calculates the hand total correctly', ()=> {
  const hands = [
    [{ rank: 1 }, { rank: 10 }],
    [{ rank: 10 }, { rank: 1 }],
    [{ rank: 1 }, { rank: 12 }],
    [{ rank: 1 }, { rank: 1 }, { rank: 1 }, { rank: 7 }],
    [{ rank: 2 }, { rank: 5 }, { rank: 13 }, { rank: 11 }],
  ];

  const values = [
    21, 21, 21, 20, 27
  ];

  const totals = hands.map(handValue);
  //let totals = [];
  //for(let i=0; i<(hands.length); i++){
  //  totals.push( handValue(hands[i]) );
  //}

  expect(totals).toEqual(values);
  for(let i=0; i<(totals.length); i++){
    expect( totals[i] ).toEqual( values[i] );
  }
});
