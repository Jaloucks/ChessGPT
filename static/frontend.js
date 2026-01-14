let board = null;
let game = new Chess();

// Function to handle drag start event
function onDragStart(source, piece, position, orientation) {
    // Don't allow moves if the game is over or it's AI's turn (black pieces)
    if (game.in_checkmate() || game.in_draw() || piece.search(/^b/) !== -1) {
        return false;
    }
}

// Function to handle the drop event (when a piece is moved)
function onDrop(source, target) {
    let move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Promote to a queen when a pawn reaches the last rank
    });

    // If the move is invalid, snap the piece back
    if (move === null) return 'snapback';

    updateStatus();

    // Get AI's rating from the input box
    let rating = document.getElementById('rating').value || '1200'; // Default to 1200 if no rating is provided

    // Send current FEN and rating to the backend
    fetch('/move', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fen: game.fen(), rating: rating })
    })
    .then(response => response.json())
    .then(data => {
        // Make AI's move
        game.move(data.move);
        board.position(game.fen());
        updateStatus();
    });
}

// Function to update the game status (checkmate, draw, or turn)
function updateStatus() {
    let status = '';
    if (game.in_checkmate()) {
        status = 'Checkmate!';
    } else if (game.in_draw()) {
        status = 'Draw!';
    } else {
        status = game.turn() === 'b' ? 'Black to move' : 'White to move';
    }
    document.getElementById('status').innerText = status;
}

// Initialize the chessboard with the starting position
board = Chessboard('board', {
    draggable: true,
    position: 'start',  // Set to starting position
    onDragStart: onDragStart,
    onDrop: onDrop
});

// Reset button to restart the game
document.getElementById('reset').addEventListener('click', function() {
    game.reset();
    board.start();  // Reset the chessboard to the starting position
    updateStatus();
});

// Call this function to update the status at the start
updateStatus();
