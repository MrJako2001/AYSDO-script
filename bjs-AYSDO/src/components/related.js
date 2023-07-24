import {
  createScript,
  getDataAttributes,
  getHtmlTemplate,
  sanitizeEntry,
  shuffle,
  templating
} from '../utils'

const template = `<div class="bjs-article">
  <img src="{{img}}"/>
  <a href="{{url}}">{{title}}</a>
</div>`

let Default = {
  id: '',
  length: 7,
  maxResults: 8,
  tags: [],
  random: true,
  template
}

const CONTAINER_ELEMENT = document.querySelector('[data-bjs=related]')

export function initRelated (data = {}) {
  if (!CONTAINER_ELEMENT) {
    return
  }

  Default = {
    ...Default,
    ...data,
    ...getDataAttributes(CONTAINER_ELEMENT)
  }

  const HTML_TEMPLATE = getHtmlTemplate(CONTAINER_ELEMENT)

  if (HTML_TEMPLATE) {
    Default.template = HTML_TEMPLATE
  }

  const labels = typeof Default.tags === 'string'
    ? JSON.parse(Default.tags)
    : Default.tags

  const tags = labels.map((tag) => `label:"${tag}"`).join('|')

  createScript(`${Default.homepage}feeds/posts/default?alt=json-in-script&callback=BloggerJS.related&max-results=${Default.maxResults}&q=${tags}`)
}

function getPostId (entry) {
  return entry.id.$t.split('.post-')[1]
}

export function related (json) {
  if (!json.feed.entry) {
    return
  }

  let html = ''

  let entry = json.feed.entry.filter((entry) => getPostId(entry) !== Default.id)

  if (Default.random) {
    entry = shuffle(entry)
  }

  const length = entry.length <= Default.length
    ? entry.length
    : Default.length

  Array.from({ length: length }).forEach((_, index) => {
    html += templating(Default.template, sanitizeEntry(entry[index], Default))
  })

  CONTAINER_ELEMENT.innerHTML = html
}
