from collections import defaultdict
import json

ATTRIBUTES = ['year', 'maxplayers', 'maxplaytime']

with open('dataset/boardgames_100.json', encoding='utf-8') as f:
    dataset = json.load(f)

def groupby_attr(data):
    for attr in ATTRIBUTES:
        grouped_data = defaultdict(list)
        
        for game in data:
            game_dict = {'id': game['id'], 'title': game['title']}
            grouped_data[game[f'{attr}']].append(game_dict)

        result = [{f'{attr}': k, 'children': v} for k, v in grouped_data.items()]

        output_path = f'dataset/boardgames_groupby_{attr}.json'
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

def groupby_categories(data):
    categories = []
    grouped_data = defaultdict(list)

    for game in data:
        game_cat = game['types']['categories']

        for cat in game_cat:
            game_dict = {'id': game['id'], 'title': game['title']}
            grouped_data[cat['id']].append(game_dict)
            if cat not in categories:
                categories.append(cat)

    result = [{'id': cat, 'name': list(filter(lambda c: c['id'] == cat, categories))[0]['name'], 'children': games} for cat, games in grouped_data.items()]  

    output_path = f'dataset/boardgames_groupby_categories.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

groupby_attr(dataset)
groupby_categories(dataset)     
