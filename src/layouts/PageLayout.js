import React, {Component, Fragment} from 'react';

class PageLayout extends Component {
  render() {
    return (
      <Fragment>
        <main>
          {this.props.children}
        </main>
      </Fragment>
    );
  }
}

export default PageLayout;