#!/bin/bash

#----------------------------------------------------------
# get ROOT directory(where current script placed) from within
SOURCE="${BASH_SOURCE[0]}"
# resolve $SOURCE until the file is no longer a symlink
while [ -h "$SOURCE" ]; do
	ROOT="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
	SOURCE="$(readlink "$SOURCE")"
	# if $SOURCE was a relative symlink, we need to resolve
	# it relative to the path where the symlink file was located
	[[ $SOURCE != /* ]] && SOURCE="$ROOT/$SOURCE"
done
ROOT="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
#----------------------------------------------------------

proj=$ROOT

cd $ROOT
case $1 in
	dev)
		bundle exec jekyll server --config=_config.yml,_config_jnpr.yml
		;;
	build)
		bundle exec jekyll build  --config=_config.yml,_config_jnpr.yml
		;;
	deploy)
		bundle exec jekyll build  --config=_config.yml,_config_jnpr.yml
		rsync -aruv _site/ ttsv-shell03:~/public_html/
		;;
	touch)
		touch $postsdir/*
		;;
	*)
		echo "jekyll.sh dev"
		echo "jekyll.sh build"
		echo "jekyll.sh deploy"
		;;
esac



