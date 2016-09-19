import React, { PropTypes } from 'react';
import Kcet from '../../components/demoClients/kcetDemo';

class KtecPage extends React.Component {

  componentDidMount() {
    document.title = "Elastic Player";
  }

  render() {
    return (
        <div className="App">
          <Kcet numOfPlayers={3}/>
        </div>
    );
  }

}

export default KtecPage;
