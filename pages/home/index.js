import React from 'react';
import Html5Demo from '../../components/demoClients/html5Demo';

class HomePage extends React.Component {

    componentDidMount() {
        document.title = 'Elastic Player';
    }

    render() {
        return (
            <div className="App">
                <Html5Demo />
            </div>
        );
    }

}

export default HomePage;
