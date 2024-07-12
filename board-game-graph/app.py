from flask import Flask, render_template, jsonify, request
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

@app.route('/api/boardgames', methods=['GET'])
def get_boardgames():
    year = request.args.get('year', type=int)
    minplayers = request.args.get('minplayers', type=int)
    maxplayers = request.args.get('maxplayers', type=int)
    minplaytime = request.args.get('minplaytime', type=int)
    maxplaytime = request.args.get('maxplaytime', type=int)
    minage = request.args.get('minage', type=int)

    filtered_boardgames = board_games

    if year:
        filtered_boardgames = [game for game in filtered_boardgames if game['year'] == year]
    if minplayers:
        filtered_boardgames = [game for game in filtered_boardgames if game['minplayers'] >= minplayers] # is == better?
    if maxplayers:
        filtered_boardgames = [game for game in filtered_boardgames if game['maxplayers'] <= maxplayers] # is == better?
    if minplaytime:
        filtered_boardgames = [game for game in filtered_boardgames if game['minplaytime'] >= minplaytime] # is == better?
    if maxplaytime:
        filtered_boardgames = [game for game in filtered_boardgames if game['maxplaytime'] <= maxplaytime] # is == better?
    if minage:
        filtered_boardgames = [game for game in filtered_boardgames if game['minage'] >= minage] # is == better?

    return jsonify(filtered_boardgames)

if __name__ == '__main__':
    app.run(debug=True)