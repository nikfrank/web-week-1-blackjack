export const dealCard = ()=> ({
  rank: Math.floor( Math.random()*13 ) + 1,
  suit: Math.floor( Math.random()*4 ),
});

export const handValue1 = hand=>{
  let total = 0;
  let hasAce = false;

  for(let i=0; i<(hand.length); i++){
    if( hand[i].rank === 1 ) hasAce = true;
    if(hand[i].rank > 10){
      total += 10;
    } else {
      total += hand[i].rank;
    }
  }

  if( hasAce && (total < 12) ) total += 10;

  return total;
};

export const handValue = hand =>
  hand.reduce(({ total, hasAce, t, ha }, card)=> ({
    hasAce: (ha = (hasAce || (card.rank === 1))),
    total: (t = total + Math.min(card.rank, 10)),
    finalTotal: ( ha && (t < 12) ) ? t + 10: t,
  }), {
    total: 0,
    hasAce: false
  }).finalTotal;


export const dealerAction = hand=> {
  let total = 0;
  let hasAce = false;

  for(let i=0; i<(hand.length); i++){
    if( hand[i].rank === 1 ) hasAce = true;
    if(hand[i].rank > 10){
      total += 10;
    } else {
      total += hand[i].rank;
    }
  }

  // dealer hits on soft seventeen
  const isSoftSeventeen = hasAce && (total === 7);
  if( isSoftSeventeen ) return 'hit';

  if( hasAce && (total < 12) ) total += 10;

  if( total >= 17 ) return 'stay';
  else return 'hit';
};


export const defHandStyle = {
  maxHeight:'34vh',
  minHeight:'34vh',

  maxWidth:'100vw',
  padding: 0,
};

export const MINIMUM_BET = 100;
