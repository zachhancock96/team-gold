import React, { Component } from 'react';
import './table.css'

/*TODO: to be able to fix column width*/
class Table extends Component {
  static defaultProps = {
    horizontalBorder: true,
    verticalBorder: false
  }

  getTableClass() {
    
    const { horizontalBorder, verticalBorder } = this.props;
    
    let style = "styled-table";
    style += horizontalBorder? " hb": "";
    style += verticalBorder? " vb": "";
    return style;
  }

  render(){
    return (<table className={this.getTableClass()}>
      {this.props.children}
    </table>);
  }
}

export default Table;