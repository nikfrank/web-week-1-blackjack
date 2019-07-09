import React from 'react';
import './App.css';
import { Hand, Card, CardBack } from 'react-deck-o-cards';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DealerCard from './DealerCard';

const dealCard = ()=> ({
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
  hand.reduce(({ total, hasAce, t }, card)=> ({
    hasAce: hasAce || (card.rank === 1),
    total: (t = total + Math.min(card.rank, 10)),
    finalTotal: ( hasAce && (t < 12) ) ? t + 10: t,
  }), {
    total: 0,
    hasAce: false
  }).finalTotal;


const dealerAction = hand=> {
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

  // soft seventeen
  if( hasAce && (total === 7) ) return 'hit';

  if( hasAce && (total < 12) ) total += 10;

  if( total >= 17 ) return 'stay';
  else return 'hit';
};


const defHandStyle = {
  maxHeight:'34vh',
  minHeight:'34vh',

  maxWidth:'100vw',
  padding: 0,
};

const MINIMUM_BET = 100;

class App extends React.Component {
  state = {
    hand: [],
    dealerHand: [],
    wallet: 1000,
    amountToBet: MINIMUM_BET,
    bet: 0,
    hasPlayerStayed: false,
  }

  bet = ()=> {
    if( (this.state.bet === 0) &&
        (this.state.amountToBet >= MINIMUM_BET) &&
        (this.state.wallet >= this.state.bet) )
      this.setState({
        wallet: this.state.wallet - this.state.amountToBet,
        bet: this.state.amountToBet,
        hand: [dealCard(), dealCard()],
        dealerHand: [dealCard()],
      });
  }

  allIn = ()=> {
    this.setState({
      amountToBet: this.state.wallet,
    });
  }

  setAmount = event=> {
    this.setState({
      amountToBet: Math.max(
        Math.min(1*event.target.value, this.state.wallet),
        MINIMUM_BET
      ),
    });
  }

  hit = ()=> {
    const newCard = dealCard();
    this.setState({
      hand: [...this.state.hand, newCard],
    }, ()=> {
      const total = handValue(this.state.hand);
      if(total > 21){
        this.lose();
      }
    });
  }

  doubleDown = ()=>{
    const newCard = dealCard();
    this.setState({
      hand: [...this.state.hand, newCard],
      bet: 2* this.state.bet,
      wallet: this.state.wallet - this.state.bet,
    }, ()=> {
      const total = handValue(this.state.hand);
      if(total > 21){
        this.lose();
      } else {
        this.stay();
      }
    });
  }

  stay = ()=> this.setState({
    hasPlayerStayed: true,
  }, ()=> this.dealerHit())

  dealerHit = ()=> {
    const nextCard = dealCard();
    const nextDealerHand = [...this.state.dealerHand, nextCard];
    const nextAction = dealerAction(nextDealerHand);

    if( nextAction === 'stay' ){
      let dealerValue = handValue(nextDealerHand);
      let playerValue = handValue(this.state.hand);
      if( ((dealerValue > playerValue) && (dealerValue <= 21)) || (
        playerValue > 21
      ) ){
        // lose
        this.lose();

      } else if( dealerValue === playerValue ){
        // push
        this.push();

      } else if( playerValue <= 21 ) {
        // win
        if( (playerValue === 21) && (this.state.hand.length === 2)){
          this.blackjack();
        } else {
          this.win();
        }
      } else console.error('this code should not run');

      this.setState({
        dealerHand: nextDealerHand
      });
    } else {
      // dealer hits.
      this.setState({
        dealerHand: nextDealerHand
      }, ()=> setTimeout(()=> this.dealerHit(), 3000 ));
    }
  }

  lose = ()=> {
    setTimeout(()=>
      this.setState({
        bet: 0,
        hand: [],
        dealerHand: [],
        hasPlayerStayed: false,
      }), 6000);

    setTimeout(()=> toast.error('YOU LOSE YOU LOSER'), 3000);
  }

  push = ()=> {
    setTimeout(()=>
      this.setState({
        wallet: this.state.wallet + this.state.bet,
        bet: 0,
        hand: [],
        dealerHand: [],
        hasPlayerStayed: false,
      }), 6000);

    setTimeout(()=> toast.warn('that was close...'), 3000);
  }

  win = ()=> {
    setTimeout(()=>
      this.setState({
        wallet: this.state.wallet + 2*this.state.bet,
        bet: 0,
        hand: [],
        dealerHand: [],
        hasPlayerStayed: false,
      }), 6000);

    setTimeout(()=> toast.info('I LIKE MONEY'), 3000);
  }

  blackjack = ()=> {
    setTimeout(()=>
      this.setState({
        wallet: this.state.wallet + 2.5*this.state.bet,
        bet: 0,
        hand: [],
        dealerHand: [],
        hasPlayerStayed: false,
      }), 6000);

    setTimeout(()=> toast.success('BLACKJACK you loser'), 3000);
  }

  render() {
    return (
      <div className="App">
        <button onClick={this.bet}>BET</button>
        <input type='number'
               onChange={this.setAmount}
               value={this.state.amountToBet} />
        <button onClick={this.allIn}>ALL IN</button>

        <div className='wallet'>Wallet: ${this.state.wallet}</div>
        <div className='bet'>Current Bet: ${this.state.bet}</div>
        <div className='dealer-hand-container'>
          {
            this.state.dealerHand.map((card, i)=>(
              <div key={i}>
                <DealerCard key={i} card={card}/>
              </div>
            ))
          }
        </div>
        <Hand cards={this.state.hand}
              hidden={false} style={defHandStyle} />

        {((this.state.bet >= MINIMUM_BET)&&(!this.state.hasPlayerStayed)) ? (
          <>
            <button onClick={this.hit}>HIT</button>
            <button onClick={this.stay}>STAY</button>
            {this.state.hand.length === 2 ? (
              <button onClick={this.doubleDown}
                      disabled={this.state.wallet < this.state.bet}>
                DOUBLE DOWN
              </button>
            ):(null)}
          </>
        ): null }
        <ToastContainer autoClose={3000}/>
      </div>
    );
  }
}

export default App;
