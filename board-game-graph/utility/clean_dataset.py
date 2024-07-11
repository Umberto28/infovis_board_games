import json

with open('boardgames_100.json', encoding='utf-8') as f:
    data = json.load(f)

top_100_ids = {game["id"] for game in data}

# This cycle removes all connections to games which are not part of the top-100
for game in data:
    if "recommendations" in game and "fans_liked" in game["recommendations"]:
        game["recommendations"]["fans_liked"] = [rec for rec in game["recommendations"]["fans_liked"] if rec in top_100_ids]

output_path = 'boardgames_100_clean.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)