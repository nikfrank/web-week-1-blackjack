import React from 'react';

import { Hand, Card, CardBack } from 'react-deck-o-cards';

export default class DealerCard extends React.Component {
  state = { rotated: false }
  componentDidMount(){
    setTimeout(()=>
      this.setState({ rotated: true }), 0);
  }

  render(){
   const { card } = this.props;
   const { rotated } = this.state;
   return (
      <div className={'dealer-hand ' + (rotated ? 'rotated' : '')}>
        <svg viewBox='0 0 100 100' className='dealer-card'>
          <Card rank={card.rank} suit={card.suit}
                cardWidth={60} cardHeight={96}
                xOffset={20} yOffset={2}/>
        </svg>
        <svg viewBox='0 0 100 100' className='dealer-card'>
          <CardBack cardWidth={60} cardHeight={96}
                    xOffset={20} yOffset={2}/>
        </svg>
      </div>
    );
  }
};
