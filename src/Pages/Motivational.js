import React, { useState } from "react";
import "../Styles/Motivational.css";
// const url = "http://localhost:3001";

function Motivational() {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [showQuote, setShowQuote] = useState(false);

  const getQuote = () => {
    fetch(`/api/quotes/`)
      .then((response) => response.json())
      .then((response) => {
        let dataQ = response;
        //Random number times the length of quotes in order to grab a random quote.
        let ranNumber = Math.floor(Math.random() * dataQ.length);
        let ranQ = dataQ[ranNumber];
        setQuote(ranQ.quote);
        setAuthor(ranQ.author);
        setShowQuote(true);
      });
  };
  //Get another random quote
  const NextQuote = () => {
    getQuote();
  };

  return (
    <div className="motivation_container">
      {!showQuote ? (
        <span className="motivation_container_span">
          Need a little push or burst of wisdom to get your focus back, or get
          you motivated? We got you covered!
        </span>
      ) : (
        <div className="fullQuote">
          <span style={{ margin: "10px" }} className="quote">
            {quote}
          </span>
          <span style={{ fontWeight: "bold" }} className="author">
            -{author}
          </span>
        </div>
      )}

      <div className="text-center my-3">
        {!showQuote ? (
          <button
            className="addWorkoutButton"
            style={{ padding: 5, cursor: "pointer" }}
            onClick={NextQuote}
          >
            Get quote
          </button>
        ) : (
          <button
            className="addWorkoutButton"
            style={{ padding: 5, cursor: "pointer", marginTop: 30 }}
            onClick={NextQuote}
          >
            Want another?
          </button>
        )}
      </div>
    </div>
  );
}

export default Motivational;
