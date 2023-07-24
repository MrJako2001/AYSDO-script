import {
  createScript,
  getDataAttributes,
  getHtmlTemplate,
  sanitizeEntry,
  templating
} from '../utils'

export const comments = {}

const template = `<div class="bjs-comments">
  <img src="{{author_image}}"/>
  <a href="{{url}}">{{author_name}}</a>
  <p>{{snippet}}</p>
</div>`

const empty = '<p>Sin comentarios</p>'

const Default = {
  maxResults: 6,
  template,
  empty
}

const CONTAINER_ELEMENT = '[data-bjs=comments]'

const createComments = ($comment, dataset, index) => {
  const callback = 'comments' + index

  comments[callback] = (json) => {
    let html = ''

    if (json.feed.entry) {
      json.feed.entry.forEach((entry) => {
        const data = sanitizeEntry(entry, dataset)
        html += templating(dataset.template, data)
      })
    } else {
      html += dataset.empty
    }
    $comment.innerHTML = html
  }

  createScript(`${dataset.homepage}feeds/comments/default?alt=json-in-script&callback=BloggerJS.comments.${callback}&max-results=${dataset.maxResults}`)
}

export function initComments (data = {}) {
  Array.from(document.querySelectorAll(CONTAINER_ELEMENT))
    .forEach(($comment, index) => {
      const config = {
        ...Default,
        ...data,
        ...getDataAttributes($comment)
      }

      const HTML_TEMPLATE = getHtmlTemplate($comment)

      if (HTML_TEMPLATE) {
        config.template = HTML_TEMPLATE
      }

      createComments($comment, config, index)
    })
}
