import React, { PropTypes } from 'react';
import Html5Demo from '../../components/demoClients/html5Demo';

class HomePage extends React.Component {

  componentDidMount() {
    document.title = "Elastic Player";
  }

  render() {
    return (
        <div className="App">
          <Html5Demo numOfPlayers={3}/>
        </div>
    );
  }

}

export default HomePage;
