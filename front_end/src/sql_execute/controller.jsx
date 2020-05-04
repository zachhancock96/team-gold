import React, { Component } from 'react';

import {Row, Col} from 'react-bootstrap';
import CodeMirror from 'codemirror';
import {api} from 'shared';
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/sql/sql';
import './style.css'

export class SqlExecute extends Component {

  textAreaRef = React.createRef();
  editor = null;

  state = {
    display: ''
  };

  componentDidMount() {
    const taEl = this.textAreaRef.current;

    this.editor = CodeMirror.fromTextArea(taEl, {
      lineNumbers: true,
      mode:  "text/x-mariadb"
    });

    this.editor.setValue("show databases;");

    console.log('sql mode');
  }

  handleSubmit = () => {
    const value = this.editor.getValue().trim();
    if (!value) {
      alert('value needed');
      return;
    }

    api.executeSql(value)
      .then(sqlResult => {
        this.setState({display: sqlResult.result});
      });
  }

  render() {
    const { display } = this.state;
    const device = this.props.state.device;
    const layoutCname = `codemirror-result-layout codemirror-result-layout-${device === 'mobile'? 'mobile': 'desktop'}`;

    return <div style={{height: '100%', paddingTop: '20px', paddingBottom: '20px'}}>

      <div style={{height: '30px'}}>
        <button onClick={this.handleSubmit}>submit</button>
      </div>

      <div style={{height: 'calc(100% - 30px)'}} className={layoutCname}>
        <div className='first'>
          <textarea ref={this.textAreaRef} />
        </div>

        <div style={{flex: 1}} className='sql-execute-result second'>
          <p className='result-header'>{terminalLogo} Result</p>
          <div className='result-body'>
            <pre>
              {display}
            </pre>
          </div>
        </div>
      </div>
      
    </div>
  }
}

SqlExecute.showNavbar = true;

const terminalLogo = <span className='span-terminal-logo'>
  <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="terminal" className="svg-inline--fa fa-terminal fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M257.981 272.971L63.638 467.314c-9.373 9.373-24.569 9.373-33.941 0L7.029 444.647c-9.357-9.357-9.375-24.522-.04-33.901L161.011 256 6.99 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L257.981 239.03c9.373 9.372 9.373 24.568 0 33.941zM640 456v-32c0-13.255-10.745-24-24-24H312c-13.255 0-24 10.745-24 24v32c0 13.255 10.745 24 24 24h304c13.255 0 24-10.745 24-24z"></path></svg>
</span>;
