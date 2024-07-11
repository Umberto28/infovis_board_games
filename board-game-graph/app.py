from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)

with open('boardgames_100_clean.json') as f:
    board_games = json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data')
def data():
    return jsonify(board_games)

if __name__ == '__main__':
    app.run(debug=True)