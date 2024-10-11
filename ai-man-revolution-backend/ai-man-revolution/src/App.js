import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import UserDashboard from './pages/UserDashboard';
import ScriptGenerator from './pages/ScriptGenerator';
import MarketingStrategy from './pages/MarketingStrategy';
import ExportOptions from './pages/ExportOptions';
import Header from './components/Header';
import Footer from './components/Footer';

const App = () => {
    return (
        <Router>
            <Header />
            <Switch>
                <Route path="/" exact component={HomePage} />
                <Route path="/dashboard" component={UserDashboard} />
                <Route path="/script-generator" component={ScriptGenerator} />
                <Route path="/marketing-strategy" component={MarketingStrategy} />
                <Route path="/export-options" component={ExportOptions} />
            </Switch>
            <Footer />
        </Router>
    );
};

export default App;
