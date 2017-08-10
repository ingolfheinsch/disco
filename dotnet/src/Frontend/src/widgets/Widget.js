import React, { Component } from 'react'

export default class Widget extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="iris-widget">
        <div className="iris-draggable-handle">
          <span>{this.props.model.name}</span>
          <div className="iris-title-bar">
            {this.props.model.titleBar}
          </div>
          <div className="iris-window-control">
            <button className="iris-button iris-icon icon-control icon-resize" onClick={ev => {
              ev.stopPropagation();
              this.props.global.addTab(this.props.model, this.props.id);
              this.props.global.removeWidget(this.props.id);
            }}></button>
            <button className="iris-button iris-icon icon-control icon-close" onClick={ev => {
              ev.stopPropagation();
              this.props.global.removeWidget(this.props.id);
            }}></button>
          </div>
        </div>
        <div className="iris-widget-body" >
          {this.props.children}
        </div>
      </div>
    )
  }
}
