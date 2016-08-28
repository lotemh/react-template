/**
 * React Static Boilerplate
 * https://github.com/kriasoft/react-static-boilerplate
 *
 * Copyright © 2015-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

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
