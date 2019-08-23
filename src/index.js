import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

//https://reactjs.org/tutorial/tutorial.html

/* shape of history state array
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

//function component (stateless): In React, function components are a simpler way to write components 
//that only contain a render method and don’t have their own state
function Square(props){
  return(
        <button 
          className = "square" 
          onClick={props.onClick}//onClick prop passed from the board component
        >
          {props.value /* X or O */} 
        </button>
  )
}

class Board extends React.Component {

  renderSquare(i) { //i is passed from the render method where this function is called 
    return( 
      <Square 
        value={this.props.squares[i]}//squares[] array prop passed from the game component

        //note that this function has no parameter because if it did then 'i' would have
        //to be passed from the Square component.
        onClick={() => this.props.onClick(i)}//onClick prop is passed from the game component 
      />
    );
  }

  render() {

    //See if you can loop adding to aSquare each iteration.
   const aSquare = this.renderSquare(0);

    return (
      <div>
        <div className="board-row">
          {aSquare}
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

class Game extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      history: [{
        //9 empty squares to initialize
        squares: Array(9).fill(null),
        squareClicked: 0,
      }],
      stepNumber: 0,
      xIsNext: true,
    }
  }
    
handleClick(i){

  const history = this.state.history.slice(0, this.state.stepNumber + 1); //trim the history by the chosen step
  const current = history[history.length -1];

  //make a copy of the squares array in the state
  //immutability
  const squares = current.squares.slice();//Note since "begin" param not provided the entire squares array is returned
  
  //ignore click if a winner has already been declared
  //or the square has alread been filled
  if(calculateWinner(squares) || squares[i]){
    return;
  }

  //fill the clicked square (array index i)  with X or O alternatively
  squares[i] = this.state.xIsNext ? 'X' : 'O';

this.state.history[history.length -1].squareClicked = i;

//console.log(this.state.history[history.length -1].squareClicked);
  this.setState({
    //adds newly filled squares array to the history array (which is an array of multiple squares arrays.)
    //() See top of page for structure of history array))
    history: history.concat([{ 
      squares: squares,
    }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,//flip the value of xIsNext to denote the next player.
      
  });

}

jumpTo(step){
  this.setState({
    stepNumber: step,
    xIsNext: (step % 2) === 0,
  });
}

  render() {
    const history = this.state.history; //make a copy of the history
    const current = history[this.state.stepNumber];//the chosen step# selects the pertinent element in the array
    let squareClicked = 0;
    const winner = calculateWinner(current.squares);

    //render a button for every element in the history array
    const moves = history.map( (step, move) => { //step corresponds to the squares in each element of the history state array; move is the index# of each element

      if(move > 0){ squareClicked = getBoxCoordinates( history[move-1].squareClicked ) }

      // squareClicked = history[move].squareClicked;
        const desc = move ? 'Go to move #' + move + " (" + squareClicked + ")" : 'Go to game start';     

        //highlight the current move
        let buttonStyle = {fontWeight: "normal"};
        if(move == this.state.stepNumber) buttonStyle = {fontWeight: "bold", backgroundColor: "yellow"};

          return(//move will provide a value for the step parameter of the jumpTo method
                  <li key={move}> 
                    <button onClick={() => this.jumpTo(move)} style={buttonStyle} >
                      {desc}
                    </button>
                  </li>          
                )
    });

    let status;

    if(winner){
      status = 'Winner: ' + winner;      
    } else{
      status = 'Next player: ' + (this.state.xisNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}//the current squares ( current is the last element in the history array, which is a copy of the history state)
            onClick={(i) => this.handleClick(i)} //note that "this" refers to the Game component object
                                                //and that "i" will be passed from Board's RenderSquare method
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

function calculateWinner(squares) {
  const lines = [//all possibly winning squares
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  //iterate through every possible winning combination
  //to find a case where the values of all 3 squares match
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function getBoxCoordinates(index)
{
  var row = 0;
  var column = 0;

  if( index <= 2){ row = 1; column = index + 1; } else;
  if( index >= 3 & index <= 5 ){ row = 2; column = index - 2;} else
  if( index >= 6 & index <= 8 ){ row = 3; column = index - 5;} 

  return column.toString() + ", " + row.toString();
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
