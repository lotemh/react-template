import React, { PropTypes } from 'react';
import Kcet from '../../components/demoClients/kcetDemo';

class KtecPage extends React.Component {

  componentDidMount() {
    document.title = "Kcet Demo";
  }

  render() {
    return (
        <div className="App">
          <Kcet/>
        </div>
    );
  }

}

export default KtecPage;
