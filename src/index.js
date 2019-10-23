import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

/*
We’ll store the past squares arrays in another array called history. The history array represents all board states, from the first to the last move, and has a shape like this:

history = [
  // Before first move
  {
    squares: [
      null, null, null,
      null, null, null,
      null, null, null,
    ]
  },
  // After first move
  {
    squares: [
      null, null, null,
      null, 'X', null,
      null, null, null,
    ]
  },
  // After second move
  {
    squares: [
      null, null, null,
      null, 'X', null,
      null, null, 'O',
    ]
  },
  // ...
]
*/
//Function component (stateless)
//Note component names should always begin with a capital letter, React treats lowercased components as DOM tags like <div>
function Square(props) {//props is a built in JS object that contains properties that can be passed from one component to another.     
    return (//returns a "React element" which creates the UI or view
        //The below is a React element written in JSX (JavaScript XML), which allows interwieving of HTML in javaScript
        //Note that react elements have only 2 properties: type(string), props(object). In the below type=button, props=classname, onclick, etc...
        //props is a built in JS object that contains properties that can be passed from one component to another.  
        //note the value prop is passed from the Board.renderSquare method     
      <button className="square" onClick ={props.onClick}>
        {props.value}
      </button>
    );
  }

//Class Component
class Board extends React.Component {    

  renderSquare(i) {

    //note: "value" is a prop(erty) of the Square component and here it's assigned the value of the square array in the squares state where index = i passed to the squares prop
    //Assign the handleClick function to the onClickHandler prop of Square component so that when ever the button is clicked
    //the handleClick function is called within the parent class (Board, this class right here)
    //Note: An arrow function is used here making "this" refer to "Board" ("Lexical Scoping", "this" from the object which contains the arrow function)
    //, otherwise if there were a reg function "this" would be null
    return( 
            <Square 
                value={this.props.squares[i]}
                onClick={ () => this.props.onClick(i) }
                /> 
            );
  }

  render() {//The render method returns a "React element" which creates the UI or view

        return (
        <div>
            <div className="board-row">
            {this.renderSquare(0)}
            {this.renderSquare(1)}
            {this.renderSquare(2)}
            </div>
            <div className="board-row">
            {this.renderSquare(3)}
            {this.renderSquare(4)}
            {this.renderSquare(5)}
            </div>
            <div className="board-row">
            {this.renderSquare(6)}
            {this.renderSquare(7)}
            {this.renderSquare(8)}
            </div>
        </div>
        );
    }
}

//Game is the top level (parent) component in this app. and manages the state of the squares.
class Game extends React.Component {
    constructor(props) {
        //super calls the base class (React.Component) constructor which must be executed first otherwise "this" will be undefined.
        //All React component classes that have a constructor should begin with a super(props) call
        //super refers to the base-class.  Props is passed to the base class so that props is accessible in the constructor.
        super(props);

        //"this" in an object that refers to the object itself, in this case "Game" and the base class "React.Component"
        //state is an object built in to react class components which stores properties and their values that can chang (within the component only) over time.
        //Note: when state changes, the component responds by re-rendering.
        this.state = {//initialize the state  
                    history: [{ //Create an empty array of arrays, with the inner array containing 9 elements representing the board at a particular time in the game
                    squares: Array(9).fill(null),
                }],
          stepNumber: 0,                
          xIsNext: true,
        };
      }

  handleClick(i){//note that the value of i has already been "prefilled" when the renderSquare function assigned the value for the onClickHandler prop as this function(handleClick)
          
     //Create a copy of the history state
     //note: We create a copy because avoiding direct data mutation lets us keep previous versions of the game’s history intact, and reuse them later.
      //Copying a slice from first element to the current; ensures that if we “go back in time” and then make a new move from that point, the “future” history will no longer be in the history.
      const history = this.state.history.slice(0, this.state.stepNumber + 1);

      //Make a copy of the most recent element in the history state, this is the current state of the board.
      const current = history[history.length - 1];

      //Create a copy of the squares in the "current" array garnered from history state.
      const squares = current.squares.slice();

      if (calculateWinner(squares) || squares[i]) {
          return;
        }

      squares[i] = this.state.xIsNext ? "X" : "O"; //give the element in the squares array with index = i a value depending on xIsNext state, either X or O
 
      //This will asynchronously trigger a rerender of the game, and in turn the board and squares 
      //which will reflect the new state since squares gets its value prop's value from props and props from state
      //squares state > current state > Board Squares prop > square value prop
      this.setState({
            history: history.concat([
                {//concat method is used to merge two or more arrays. This method does not change the existing arrays, but instead returns a new array.
                    squares: squares//update the state with the changes made to the square in squares constant (which reflect the current history)
                }
        ]),
        stepNumber: history.length,//Current step number is the # of historical steps so far (the history constant)
        xIsNext: !this.state.xIsNext//alternate the value of xIsNext so that X or O is displayed
      }); 

  }

  //go back to a previous move
  jumpTo(step) {
    this.setState({
      stepNumber: step,//Changes the stepNumber state value to the move value associated with the particular move button clicked which comes from the history state array's Indexes
      xIsNext: (step % 2) === 0,//Player X is next if the step# is even.
    });
  }

  render() {
        const history = this.state.history; //make a copy of the history

        const current = history[this.state.stepNumber]; //make a copy of the history at the current step

        //Return the value of one of the winning squares if there are 3 contiguous squares with the same value (either X or O)
        const winner = calculateWinner(current.squares);

        //Generate a button element for every item in the history that when clicked 
        //re-renders the board a certain amount of steps back.
        const moves = history.map( (step, move) => {// .map( (element, index) => do stuff )
            const desc = move ?
              'Go to move #' + move :
              'Go to game start';

            //Each button's onclick property is passed a reference to the jumpto Function with the respective move as parameter.
            //Note the arrow function allows access to the move constant in the component.
            //specify a key property for each list item to differentiate each list item from its siblings
            return (
                    <li key={move}>
                        <button onClick={() => this.jumpTo(move)}>{desc}</button>
                    </li>
                   );
          });

        let status;
        if (winner) {//If there's a winner the status message denotes the winner (x or o)
                        status = 'Winner: ' + winner;
                    } 
        else {//otherwise denote the next player
                status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');//If xIsNext=true then return X as the next player, otherwise O
            }
            //squares={current.squares} passes the current state of the squares to be rendered by the board.
            //Note the handleClick function is passed down all the way to the square component and assigned to the buttons onClick event property
            //The value of i is passed in by the board component in the renderSquare function
            return (
                    <div className="game">
                        <div className="game-board">
                            <Board 
                                squares={current.squares}
                                onClick={i => this.handleClick(i)}
                            />
                        </div>
                        <div className="game-info">
                            <div>{status}</div>
                            <ol>{moves}</ol>
                        </div>
                    </div>
            );
            }
}

//Returns an element from the squares array passed in params if there are 3 contiguous squares with the same marking( x or o)
function calculateWinner(squares) {

    //the indexes of every possible combination of winning squares
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    //iterate through the elements of the lines array-of-arrays
    //, take each of the 3 elements in the inner array as indexes for 3 square elements,
    //and if the values match return the value of the 1st square.
    for ( let i = 0; i < lines.length; i++ ) {
      const [a, b, c] = lines[i];//Add the values of the array in Index=i and spread them to constants a, b, & c
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) //compare the values of the 3 squares
        {
            return squares[a];
        }
    }
    return null;
  }

// ========================================

/*ReactDOM.render(element, container[, callback])
Render a React element into the DOM in the supplied container..

If the React element was previously rendered into container, this will perform an update on it and only mutate the DOM as necessary to reflect the latest React element.

If the optional callback is provided, it will be executed after the component is rendered or updated.

So below the <Game/> element is rendered into the root (top level) node.
*/
ReactDOM.render(
  <Game />,
  document.getElementById('root')//The root node which is the top element in this document.
  
);
