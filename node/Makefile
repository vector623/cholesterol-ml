#!make

pull:
	ollama pull llama3.2-vision

init:
	npm install --save-dev typescript
	npx tsc --init

data/cholesterol-data:
	mkdir -p data/
	curl -L https://ptcdevs-public.us-southeast-1.linodeobjects.com/cholesterol-data.tar.gz |\
		tar -zx -C ./data/

ollama-test:
	OLLAMA_HOST='http://dgp5000:11434' ollama run llama2 "Hello"

clean:
	 rm -rf dist/
	 rm -rf build/

monitor:
	ssh -t davidg@dgp5000 'TERM=xterm-256color \
		tmux new-session \; \
			split-window -v \; \
			send-keys "btop" C-m \; \
			select-pane -t 0 \; \
			send-keys "nvtop" C-m'