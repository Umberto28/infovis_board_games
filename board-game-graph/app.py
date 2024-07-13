from flask import Flask, render_template, jsonify
import json

app = Flask(__name__)

# Load dataset
with open('dataset/boardgames_100_clean.json') as f: # change this to boardgames_100_clean.json to use the clean dataset
    board_games = json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data')
def data():
    return jsonify(board_games)

# with open('dataset/boardgames_groupby_year.json') as f: # change this to boardgames_100_clean.json to use the clean dataset
#     board_games = json.load(f)

# @app.route('/data/year')
# def data_year():
#     return jsonify(board_games)

if __name__ == '__main__':
    app.run(debug=True)
