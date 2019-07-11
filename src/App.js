import React from 'react';
import './App.css';
import { Hand, Card, CardBack } from 'react-deck-o-cards';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DealerCard from './DealerCard';
import Player from './Player';

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
  hand.reduce(({ total, hasAce, t, ha }, card)=> ({
    hasAce: (ha = (hasAce || (card.rank === 1))),
    total: (t = total + Math.min(card.rank, 10)),
    finalTotal: ( ha && (t < 12) ) ? t + 10: t,
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

  // dealer hits on soft seventeen
  const isSoftSeventeen = hasAce && (total === 7);
  if( isSoftSeventeen ) return 'hit';

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
    dealerHand: [],
    players: [
      {
        hand: [],
        wallet: 1000,
        amountToBet: MINIMUM_BET,
        bet: 0,
        hasPlayerStayed: false,
      }
    ],
  }

  bet = (pid)=> {
    if( (this.state.players[pid].bet === 0) &&
        (this.state.players[pid].amountToBet >= MINIMUM_BET) &&
        (this.state.players[pid].wallet >= this.state.players[pid].bet) )

      this.setState({
        players: this.state.players.map((player, i)=>
          pid !== i ? player : ({
            ...player,
            wallet: player.wallet - player.amountToBet,
            bet: player.amountToBet,
            hand: [dealCard(), dealCard()],
          })
        ),
        dealerHand: (this.state.dealerHand.length) ?
           this.state.dealerHand :
           [dealCard()],
      });
  }

  allIn = (pid)=> {
    this.setState({
      players: this.state.players.map((player, i)=>
        pid !== i ? player : ({
          ...player,
          amountToBet: player.wallet,
        })
      )
    });
  }

  setAmount = (pid, amount)=> {
    this.setState({
      players: this.state.players.map((player, i)=>
        pid !== i ? player : ({
          ...player,
          amountToBet: Math.max(
            Math.min(1*amount, player.wallet),
            MINIMUM_BET
          ),
        })
      )
    });
  }

  hit = (pid)=> {
    const newCard = dealCard();
    this.setState({
      players: this.state.players.map((player, i)=>
        pid !== i ? player : ({
          ...player,
          hand: [...player.hand, newCard],
        })
      ),
    }, ()=> {
      const total = handValue(this.state.players[pid].hand);
      if(total > 21){
        this.lose(pid);
      }
    });
  }

  doubleDown = (pid)=>{
    const newCard = dealCard();
    this.setState({
      players: this.state.players.map((player, i)=>
        pid !== i ? player : ({
          ...player,
          hand: [...player.hand, newCard],
          bet: 2* player.bet,
          wallet: player.wallet - player.bet,
        })
      )
    }, ()=> {
      const total = handValue(this.state.players[pid].hand);
      if(total > 21){
        this.lose(pid);
      } else {
        this.stay(pid);
      }
    });
  }

  stay = (pid)=> this.setState({
    players: this.state.players.map((player, i)=>
      pid !== i ? player : ({
        ...player,
        hasPlayerStayed: true,
      })
    )
  }, ()=> {
    let allPlayersStayed = true;
    for(let i=0; i<(this.state.players.length); i++){
      if( !this.state.players[i].hasPlayerStayed ){
        allPlayersStayed = false;
      }
    }

    const allPlayersDone = this.state.players.reduce((done, player)=>{
      return done && player.hasPlayerStayed;
    }, true);

    if( allPlayersStayed ) this.dealerHit();
  })

  dealerHit = ()=> {
    const nextCard = dealCard();
    const nextDealerHand = [...this.state.dealerHand, nextCard];
    const nextAction = dealerAction(nextDealerHand);

    if( nextAction === 'stay' ){
      let dealerValue = handValue(nextDealerHand);

      for(let i=0; i<(this.state.players.length); i++){
        let playerValue = handValue(this.state.players[i].hand);

        if( ((dealerValue > playerValue) && (dealerValue <= 21)) || (
          playerValue > 21
        ) ){
          // lose
          this.lose(i);

        } else if( dealerValue === playerValue ){
          // push
          this.push(i);

        } else if( playerValue <= 21 ) {
          // win
          if( (playerValue === 21) && (this.state.players[i].hand.length === 2)){
            this.blackjack(i);
          } else {
            this.win(i);
          }
        } else console.error('this code should not run');
      }

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

  lose = (pid)=> {
    setTimeout(()=>
      this.setState({
        players: this.state.players.map((player, i)=>
         pid !== i ? player : ({
           ...player,
           bet: 0,
           hand: [],
           hasPlayerStayed: false,
         })
       )
     }, this.checkIfEveryoneDone), 6000);

    setTimeout(()=> toast.error('YOU LOSE YOU LOSER'), 3000);
  }

  push = (pid)=> {
    setTimeout(()=>
      this.setState({
        players: this.state.players.map((player, i)=>
          pid !== i ? player : ({
            ...player,
            wallet: player.wallet + player.bet,
            bet: 0,
            hand: [],
            hasPlayerStayed: false,
          })
        )
      }, this.checkIfEveryoneDone), 6000);

    setTimeout(()=> toast.warn('that was close...'), 3000);
  }

  win = (pid)=> {
    setTimeout(()=>
      this.setState({
        players: this.state.players.map((player, i)=>
          pid !== i ? player : ({
            ...player,
            wallet: player.wallet + 2*player.bet,
            bet: 0,
            hand: [],
            hasPlayerStayed: false,
          })
        )
      }, this.checkIfEveryoneDone), 6000);

    setTimeout(()=> toast.info('I LIKE MONEY'), 3000);
  }

  blackjack = (pid)=> {
    setTimeout(()=>
      this.setState({
        players: this.state.players.map((player, i)=>
          pid !== i ? player : ({
            ...player,
            wallet: player.wallet + 2.5*player.bet,
            bet: 0,
            hand: [],
            hasPlayerStayed: false,
          })
        )
      }, this.checkIfEveryoneDone), 6000);

    setTimeout(()=> toast.success('BLACKJACK you loser'), 3000);
  }

  checkIfEveryoneDone = ()=> {
    const allPlayersReset = this.state.players.reduce((done, player)=>{
      return (player.bet === 0) && done;
    }, true);

    if( allPlayersReset ) this.setState({
      dealerHand: [],
    });
  }

  render() {
    return (
      <div className="App">
        <div className='dealer-hand-container'>
          {
            this.state.dealerHand.map((card, i)=>(
              <div key={i}>
                <DealerCard key={i} card={card}/>
              </div>
            ))
          }
        </div>
        <Player {...this.state.players[0]}
                pid={0}
                betAmount={this.bet}
                doubleDown={this.doubleDown}
                stay={this.stay}
                hit={this.hit}
                allIn={this.allIn}
                setAmount={this.setAmount} />
        <ToastContainer autoClose={3000}/>
      </div>
    );
  }
}

export default App;
