import React, { PropTypes } from 'react';
import ElasticPlayer from '../../components/ElasticPlayer';

class HomePage extends React.Component {

  componentDidMount() {
    document.title = "Elastic Player";
  }

  render() {
    return (
        <div className="App">
          <ElasticPlayer numOfPlayers={3}/>
        </div>
    );
  }

}

export default HomePage;
