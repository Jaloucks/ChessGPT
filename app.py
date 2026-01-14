from flask import Flask, request, jsonify, render_template
import chess
import openai
import config

app = Flask(__name__)

openai.api_key = config.OPENAI_API_KEY

@app.route('/')
def index():
    return render_template('index.html')

# Define a function to get a move suggestion from ChatGPT
def get_gpt_move(fen, rating):
    prompt = f"""
    You are playing chess at a skill level of {rating}. The current board position in FEN format is {fen}. 
    Please provide your next move in UCI format.
    """
    
    response = openai.completions.create(
        engine="gpt-4o",
        prompt=prompt,
        max_tokens=50,
        temperature=0.7
    )
    
    gpt_move = response.choices[0].text.strip()
    return gpt_move

@app.route('/move')
def move():
    data = request.get_json()
    fen = data['fen']
    rating = data['rating']
    
    gpt_move = get_gpt_move(fen, rating)
    board = chess.Board(fen)
    move = chess.Move.from_uci(gpt_move)
    if move in board.legal_moves:
        board.push(move)
        return jsonify({"move": gpt_move})
    else:
        return jsonify({"error": "Invalid move generated"}), 400

if __name__ == '__main__':
    app.run(debug=True)
