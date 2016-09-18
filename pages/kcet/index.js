import React, { PropTypes } from 'react';
import Kcet from '../../components/demoClients/kcetDemo';

class KtecPage extends React.Component {

  componentDidMount() {
    document.title = "Elastic Player";
  }

  render() {
    return (
        <div className="App">
          <div className="menu">
            <h1>Elastic Media Player Demo</h1>
          </div>
          <Kcet numOfPlayers={3}/>
        </div>
    );
  }

}

export default KtecPage;
