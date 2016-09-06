import React, { PropTypes } from 'react';
import ElasticPlayer from '../../components/ElasticPlayer';

class HomePage extends React.Component {

  componentDidMount() {
    document.title = "Elastic Player";
  }

  render() {
    return (
        <div className="App">
          <div className="menu">
            <h1>Elastic Media Player Demo</h1>
          </div>
          <ElasticPlayer numOfPlayers={3}/>
        </div>
    );
  }

}

export default HomePage;
