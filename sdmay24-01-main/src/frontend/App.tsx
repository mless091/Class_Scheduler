import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.css';
import RootModule from './RootModule';
import Classes from './Classes';
import Cohort from './Cohort';
import Import from './Import';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Switch>
            <Route path="/classes">
              <Classes />
            </Route>
            <Route path="/cohort">
            <Cohort />
            </Route>
            <Route path="/import">
            <Import />
            </Route>
              <RootModule />
            <Route path="/">
              <RootModule />
            </Route>
          </Switch>
        </header>
      </div>
    </Router>
  );
}

export default App;