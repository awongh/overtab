import html from './lib/html'

const process = function({action, buildPath, scripts}) {
  console.log( buildPath );

  scripts.push(html("index.html", buildPath))

  return true
}

export default function(manifest, {buildPath}) {

  const scripts = []

  process({action: null, buildPath, scripts})

  return {scripts}
}
