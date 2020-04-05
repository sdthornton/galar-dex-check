# Activate and configure extensions
# https://middlemanapp.com/advanced/configuration/#configuring-extensions

activate :autoprefixer do |prefix|
  prefix.browsers = "last 2 versions"
end

activate :external_pipeline,
  name: :webpack,
  command: build? ? './node_modules/webpack/bin/webpack.js --bail' : './node_modules/webpack/bin/webpack.js --watch -d',
  source: ".tmp/dist",
  latency: 1

activate :dotenv
activate :asset_hash
# activate :directory_indexes

# Per-page layout changes
page '/*.xml', layout: false
page '/*.json', layout: false
page '/*.txt', layout: false

configure :development do
  activate :livereload
end

set :build_dir, 'docs'

configure :build do
  ignore '/javascripts/components/*.vue'
  ignore '/javascripts/site.js'
  activate :asset_host, host: '//sdthornton.github.io/galar-dex-check/'
  activate :minify_css
  activate :minify_html
  activate :minify_javascript
  activate :gzip
end
