docker login -u _ -p 9eceb20f-a2b8-4d4c-89a1-12a7434175f4 registry.heroku.com

docker build --file=backend/Dockerfile --rm=true -t registry.heroku.com/midi-search-api/web ./backend
# docker build --file=frontend/Dockerfile --rm=true -t registry.heroku.com/midi-search/web ./frontend

docker push registry.heroku.com/midi-search-api/web
# docker push registry.heroku.com/midi-search/web

heroku container:release web -a midi-search-api
# heroku container:release web -a midi-search