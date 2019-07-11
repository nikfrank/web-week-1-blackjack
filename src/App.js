import React from 'react';
import './App.css';
import { Hand, Card, CardBack } from 'react-deck-o-cards';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DealerCard from './DealerCard';
import Player from './Player';

import {
  dealCard,
  handValue,
  dealerAction,
  defHandStyle,
  MINIMUM_BET
} from './util';

class App extends React.Component {
  state = {
    dealerHand: [],
    dealerDone: false,
    players: [
      {
        hand: [],
        wallet: 1000,
        amountToBet: MINIMUM_BET,
        bet: 0,
        hasPlayerStayed: false,
        doneHand: false,
      },
      {
        hand: [],
        wallet: 1000,
        amountToBet: MINIMUM_BET,
        bet: 0,
        hasPlayerStayed: false,
        doneHand: false,
      },
    ],
  }

  bet = (pid)=> {
    if( !this.state.players[pid].doneHand &&
        (this.state.players[pid].bet === 0) &&
        (this.state.players[pid].amountToBet >= MINIMUM_BET) &&
        (this.state.players[pid].wallet >= this.state.players[pid].amountToBet) )

      this.setState({
        players: this.state.players.map((player, i)=>
          pid !== i ? player : ({
            ...player,
            wallet: player.wallet - player.amountToBet,
            bet: player.amountToBet,
            hand: [dealCard(), dealCard()],
          })
        ),
      }, ()=> {
        this.setState({
          dealerHand: (this.state.dealerHand.length || (
            !this.state.players.reduce((ready, player)=> {
              return ready && (player.bet || (player.wallet < MINIMUM_BET));
            }, true)
          )) ?
             this.state.dealerHand :
             [dealCard()],
        })
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
      if( !this.state.players[i].hasPlayerStayed && this.state.players[i].bet){
        allPlayersStayed = false;
      }
    }

    const allPlayersDone = this.state.players.reduce((done, player)=>{
      return done && player.hasPlayerStayed && player.bet;
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
        } else console.log('this code should not run', this.state.players[i]);
      }

      this.setState({
        dealerHand: nextDealerHand,
        dealerDone: true,
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
           doneHand: true,
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
            doneHand: true,
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
            doneHand: true,
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
            doneHand: true,
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
      dealerDone: false,
      players: this.state.players.map((player, i)=> ({
        ...player, doneHand: false,
      }))
    });
    else {
      const allPlayersDone = this.state.players.reduce((done, player)=>{
        return done && (player.hasPlayerStayed || (player.bet === 0));
      }, true);

      if( allPlayersDone && !this.state.dealerDone ) this.dealerHit();
    }

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
        <Player {...this.state.players[1]}
                pid={1}
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
