from flask import Flask, render_template, jsonify, request
import json

app = Flask(__name__)

with open('dataset/boardgames_100_clean.json', encoding='utf-8') as f: # change this to boardgames_100_clean.json to use the clean dataset
    board_games = json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/data') # accessible only by adding /data in the URL, maybe implement link?
def data():
    return jsonify(board_games)

@app.route('/api/boardgames', methods=['GET'])
def get_boardgames():
    year = request.args.get('year')
    minplayers = request.args.get('minplayers')
    maxplayers = request.args.get('maxplayers')
    minplaytime = request.args.get('minplaytime')
    maxplaytime = request.args.get('maxplaytime')
    minage = request.args.get('minage')
    categories = request.args.get('categories')
    mechanics = request.args.get('mechanics')
    designer = request.args.get('designer')

    filtered_boardgames = board_games

    if year:
        years = list(map(int, year.split('|')))
        filtered_boardgames = [game for game in filtered_boardgames if game['year'] in years]
    if minplayers:
        minplayers_list = list(map(int, minplayers.split('|')))
        filtered_boardgames = [game for game in filtered_boardgames if game['minplayers'] in minplayers_list]
    if maxplayers:
        maxplayers_list = list(map(int, maxplayers.split('|')))
        filtered_boardgames = [game for game in filtered_boardgames if game['maxplayers'] in maxplayers_list]
    if minplaytime:
        minplaytime_list = list(map(int, minplaytime.split('|')))
        filtered_boardgames = [game for game in filtered_boardgames if game['minplaytime'] in minplaytime_list]
    if maxplaytime:
        maxplaytime_list = list(map(int, maxplaytime.split('|')))
        filtered_boardgames = [game for game in filtered_boardgames if game['maxplaytime'] in maxplaytime_list]
    if minage:
        minage_list = list(map(int, minage.split('|')))
        filtered_boardgames = [game for game in filtered_boardgames if game['minage'] in minage_list]
    if categories:
        categories_list = categories.split('|')
        filtered_boardgames = [game for game in filtered_boardgames if any(category['name'] in categories_list for category in game['types']['categories'])]
    if mechanics:
        mechanics_list = mechanics.split('|')
        filtered_boardgames = [game for game in filtered_boardgames if any(mechanic['name'] in mechanics_list for mechanic in game['types']['mechanics'])]
    if designer:
        designer_list = designer.split('|')
        filtered_boardgames = [game for game in filtered_boardgames if any(designer['name'] in designer_list for designer in game['credit']['designer'])]

    return jsonify(filtered_boardgames)

# @app.route('/data/year')
# def data_year():
#     return jsonify(board_games)

if __name__ == '__main__':
    app.run(debug=True)