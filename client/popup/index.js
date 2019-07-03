/* eslint-disable no-return-assign */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const getTabs = function(object) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(object, function(data) {
      resolve(data);
    });
  });
};

class App extends Component {
  constructor() {
    super();
    this.state = {};
  }
  sendToHomePage() {
    chrome.tabs.create({ url: 'localhost:8080/home' });
  }
  saveTab(tab) {
    const formattedTab = {
      title: tab.title,
      url: tab.url,
      favicon: tab.favIconUrl,
    };

    axios
      .post('http://localhost:8080/api/links/', [formattedTab])
      .then(this.closeTab(tab.id));
  }

  saveAllTabs(allTabs) {
    const formattedTabs = allTabs.map(tab => {
      return {
        title: tab.title,
        url: tab.url,
        favicon: tab.favIconUrl,
      };
    });

    axios.post('http://localhost:8080/api/links/', formattedTabs).then(
      allTabs.forEach(tab => {
        return this.closeTab(tab.id);
      })
    );
  }

  closeTab(id) {
    chrome.tabs.remove(id);
    this.setState(state => {
      return { tabs: state.tabs.filter(el => el.id !== id) };
    });
  }

  componentDidMount() {
    getTabs({}).then(tabs => this.setState({ tabs }));
  }

  render() {
    const tabs = this.state.tabs;
    return (
      <div>
        {tabs ? (
          <div>
            {tabs.map(tab => (
              <div
                key={tab.id}
                className="field is-grouped is-grouped-multiline has-icons-left has-icons-right"
              >
                <div className="control">
                  <div className="tags has-addons">
                    <span
                      className="icon is-small"
                      onClick={() => this.saveTab(tab)}
                    >
                      <i className="fas fa-plus" aria-hidden="true" />
                    </span>
                    <a className="tag is-link">
                      <figure className="image is-16x16">
                        <img src={tab.favIconUrl} />
                      </figure>
                      <div className="field" style={{ width: '200px' }}>
                        {tab.title.slice(0, 35)}
                      </div>
                    </a>
                    <a
                      className="tag is-delete"
                      onClick={() => this.closeTab(tab.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              className="button"
              type="button"
              onClick={() => {
                this.saveAllTabs(tabs);
              }}
            >
              Save All Tabs
            </button>
            <button
              className="button"
              type="submit"
              onClick={this.sendToHomePage}
            >
              My Collection
            </button>
          </div>
        ) : (
          <h1>loading</h1>
        )}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
