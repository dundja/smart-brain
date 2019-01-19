import React, { Component } from "react";
import Clarifai from "clarifai";
import "./App.css";
import Particles from "react-particles-js";
import Navigation from "./components/Navigation/Navigation";
import Logo from "./components/Logo/Logo";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Rank from "./components/Rank/Rank";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import SignIn from "./components/SignIn/SignIn";
import Register from "./components/Register/Register";

const particlesOptions = {
  particles: {
    number: {
      value: 50
    },
    size: {
      value: 3
    }
  },
  interactivity: {
    events: {
      onhover: {
        enable: true,
        mode: "repulse"
      }
    }
  }
};

const app = new Clarifai.App({
  apiKey: "3dcb96dac063442fb1ac5852e99306ff"
});

class App extends Component {
  state = {
    input: "",
    imageUrl: "",
    box: {},
    route: "signin",
    isSignedIn: false,
    user: {
      id: "",
      name: "",
      email: "",
      entries: 0,
      joined: new Date()
    }
  };

  _loadUser = data => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    });
  };

  _calculateFaceLocation = data => {
    // eslint-disable-next-line
    const clarifiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputImage");
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifiFace.left_col * width,
      topRow: clarifiFace.top_row * height,
      rightCol: width - clarifiFace.right_col * width,
      bottomRow: height - clarifiFace.bottom_row * height
    };
  };

  _displayFaceBox = box => {
    console.log(box);
    this.setState({ box: box });
  };

  _onInputChange = e => {
    this.setState({ input: e.target.value });
  };

  _onPictureSubmit = () => {
    this.setState({ imageUrl: this.state.input });
    app.models
      .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
      .then(response => {
        if (response) {
          fetch("http://localhost:3000/image", {
            method: "put",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count }));
            });
        }
        this._displayFaceBox(this._calculateFaceLocation(response));
      })
      .catch(err => {
        console.log(err);
      });
  };

  _onRouteChange = route => {
    if (route === "signout") {
      this.setState({ isSignedIn: false });
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state;

    return (
      <div className="App">
        <Particles className="particles" params={particlesOptions} />
        <Navigation
          onRouteChange={this._onRouteChange}
          isSignedIn={isSignedIn}
        />
        {route === "home" ? (
          <div>
            <Logo />
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />
            <ImageLinkForm
              onInputChange={this._onInputChange}
              onPictureSubmit={this._onPictureSubmit}
            />
            <FaceRecognition box={box} imageUrl={imageUrl} />
          </div>
        ) : route === "signin" ? (
          <SignIn
            onRouteChange={this._onRouteChange}
            loadUser={this._loadUser}
          />
        ) : (
          <Register
            onRouteChange={this._onRouteChange}
            loadUser={this._loadUser}
          />
        )}
      </div>
    );
  }
}

export default App;
