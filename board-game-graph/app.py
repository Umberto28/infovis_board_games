import os
import json
from jinja2 import TemplateNotFound
from flask import Flask, render_template, jsonify, request, send_from_directory

app = Flask(__name__)

with open('dataset/boardgames_100_clean.json', encoding='utf-8') as f:
    board_games = json.load(f)

@app.route('/')
def index():
    return render_template('sections/list_vis.html')

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(
        os.path.join(app.root_path, 'static'),
        'favicon.ico',
        mimetype='image/vnd.microsoft.icon'
    )

@app.route('/<template>')
def route_template(template):
    try:

        if not template.endswith('.html') :
            template += '.html'

        # Detect the current page
        segment = get_segment(request)

        # Serve the file (if exists) from app/templates/home/FILE.html
        return render_template("sections/" + template, segment=segment)

    except TemplateNotFound:
        # return render_template('home/page-404.html'), 404
        print(f'{template}: Exeption 404')

    except:
        # return render_template('home/page-500.html'), 500
        print(f'{template}: Exeption 500')


# Helper - Extract current page name from request
def get_segment(request):
    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'list_vis'

        return segment

    except:
        return None

@app.route('/data')
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
    designers = request.args.get('designer')

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
        categories_mode = categories_list[0]
        if categories_mode == 'AND':
            categories_list.pop(0)
            filtered_boardgames = [game for game in filtered_boardgames
                                    if all(any(c['name'] == category for c in game['types']['categories'])
                                        for category in categories_list)]
        else:
            filtered_boardgames = [game for game in filtered_boardgames if any(category['name'] in categories_list for category in game['types']['categories'])]
    if mechanics:
        mechanics_list = mechanics.split('|')
        mechanics_mode = mechanics_list[0]
        if mechanics_mode == 'AND':
            mechanics_list.pop(0)
            filtered_boardgames = [game for game in filtered_boardgames
                                    if all(any(m['name'] == mechanic for m in game['types']['mechanics'])
                                        for mechanic in mechanics_list)]
        else:
            filtered_boardgames = [game for game in filtered_boardgames if any(mechanic['name'] in mechanics_list for mechanic in game['types']['mechanics'])]
    if designers:
        designers_list = designers.split('|')
        designers_mode = designers_list[0]
        if designers_mode == 'AND':
            designers_list.pop(0)
            filtered_boardgames = [game for game in filtered_boardgames
                                    if all(any(d['name'] == designer for d in game['types']['designer'])
                                        for designer in designers_list)]
        else:
            filtered_boardgames = [game for game in filtered_boardgames if any(designer['name'] in designers_list for designer in game['credit']['designer'])]

    return jsonify(filtered_boardgames)

@app.route('/api/boardgames_cluster', methods=['GET'])
def get_boardgames_cluster():
    cluster_attr = list(request.args.keys())[0]
    clustered_boardgames = {}
    
    if (cluster_attr == 'categories' or cluster_attr == 'mechanics'):
        for entity in board_games:
            attr = entity.get('types').get(cluster_attr)
            for a in attr:
                name = a.get('name')
                if name is not None:
                    if name not in clustered_boardgames:
                        clustered_boardgames[name] = 0
                    clustered_boardgames[name] += 1
    elif (cluster_attr == 'designer'):
        for entity in board_games:
            attr = entity.get('credit').get(cluster_attr)
            for a in attr:
                name = a.get('name')
                if name is not None:
                    if name not in clustered_boardgames:
                        clustered_boardgames[name] = 0
                    clustered_boardgames[name] += 1
    else:
        for entity in board_games:
            attr = entity.get(cluster_attr)
            if attr is not None:
                if attr not in clustered_boardgames:
                    clustered_boardgames[attr] = 0
                clustered_boardgames[attr] += 1

    return jsonify(clustered_boardgames)

if __name__ == '__main__':
    app.run(debug=True)