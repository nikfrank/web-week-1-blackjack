import React from 'react';
import { Hand } from 'react-deck-o-cards';

import {
  handValue,
  defHandStyle,
  MINIMUM_BET
} from './util';

class Player extends React.Component {

  render(){
    const {
      pid, hand, amountToBet, bet, wallet, hasPlayerStayed,
      betAmount, hit, stay, allIn, setAmount, doubleDown
    } = this.props;

    return (
      <div>
        <button onClick={()=> betAmount(pid)}>BET</button>
        <input type='number'
               onChange={(event)=> setAmount(pid, event.target.value)}
               value={amountToBet}
        />

        <button onClick={()=> allIn(pid)}>ALL IN</button>

        <div className='wallet'>Wallet: ${wallet}</div>
        <div className='bet'>Current Bet: ${bet}</div>

        <Hand cards={hand}
              hidden={false} style={defHandStyle} />

        {((bet >= MINIMUM_BET)&&(!hasPlayerStayed)&& (handValue(hand)<=21)) ? (
          <>
            <button onClick={()=> hit(pid)}>HIT</button>
            <button onClick={()=> stay(pid)}>STAY</button>
            {hand.length === 2 ? (
              <button onClick={()=> doubleDown(pid)}
                      disabled={wallet < bet}>
                DOUBLE DOWN
              </button>
            ):(null)}
          </>
        ): null }
      </div>
    );
  }
};

export default Player;
