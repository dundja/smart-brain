import React, { Component } from "react";

import "./FaceRecognition.css";

class FaceRecognition extends Component {
  render() {
    const { imageUrl, box } = this.props;
    return (
      <div className="center ma">
        <div className="absolute mt2 ">
          <img id="inputImage" src={imageUrl} width="500xp" height="auto" />
          <div
            className="bounding-box"
            style={{
              top: box.topRow,
              right: box.rightCol,
              bottom: box.bottomRow,
              left: box.leftCol
            }}
          />
        </div>
      </div>
    );
  }
}

export default FaceRecognition;
