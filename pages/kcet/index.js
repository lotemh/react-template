import React, { PropTypes } from 'react';
import Ktec from '../../components/demoClients/ktecDemo';

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
          <Ktec numOfPlayers={3}/>
        </div>
    );
  }

}

export default KtecPage;
