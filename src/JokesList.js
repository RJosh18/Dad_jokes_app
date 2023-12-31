import React, { Component } from "react";
import axios from "axios";
import "./JokeList.css";
import Joke from "./Joke";
// import uuid from "uuid/v4";
import { v4 as uuidv4 } from "uuid";

class JokesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      loading: false,
    };
    this.seenJokes = new Set(this.state.jokes.map((j) => j.text));
    console.log(this.seenJokes);
    this.handleClick = this.handleClick.bind(this);
  }

  static defaultProps = {
    numJokesToGet: 10,
  };

  componentDidMount() {
    if (this.state.jokes.length === 0) this.getJokes();
    window.addEventListener("beforeunload", this.handleBeforeUnload);
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
  }

  handleBeforeUnload = () => {
    localStorage.clear();
  };
  async getJokes() {
    try {
      let jokes = [];
      const seenJokes = new Set(this.state.jokes.map((j) => j.text));
      while (jokes.length < this.props.numJokesToGet) {
        let res = await axios.get("http://icanhazdadjoke.com/", {
          headers: { Accept: "application/json" },
        });
        let newJoke = res.data.joke;
        if (!this.seenJokes.has(newJoke)) {
          jokes.push({ id: uuidv4(), text: newJoke, votes: 0 });
          this.seenJokes.add(newJoke);
        } else {
          console.log("Found a duplicate");
          console.log(newJoke);
        }
      }

      this.setState(
        (st) => ({
          loading: false,
          jokes: [...st.jokes, ...jokes],
        }),
        () => window.localStorage.setItem("jokes", JSON.stringify(jokes))
      );
    } catch (e) {
      alert(e);
      this.setState({ loading: false });
    }
  }

  handleVote(id, delta) {
    this.setState(
      (st) => ({
        jokes: st.jokes.map((j) =>
          j.id === id ? { ...j, votes: j.votes + delta } : j
        ),
      }),
      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }
  handleClick() {
    this.setState({ loading: true }, this.getJokes);
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="JokeList-spinner">
          <i className="far fa-laugh fa-spin" />
          <h1 className="JokeList-title">Loading...</h1>
        </div>
      );
    }
    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Dad</span> Jokes!
          </h1>
          <img src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg" />
          <button className="JokeList-getmore" onClick={this.handleClick}>
            Fetch Jokes
          </button>
        </div>
        <div className="JokeList-jokes">
          {this.state.jokes.map((j) => (
            <Joke
              key={j.id}
              votes={j.votes}
              text={j.text}
              upVote={() => this.handleVote(j.id, 1)}
              downVote={() => this.handleVote(j.id, -1)}
            />
          ))}
        </div>
      </div>
    );
  }
}
export default JokesList;
