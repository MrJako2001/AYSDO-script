import {
  createScript,
  getDataAttributes,
  getHtmlTemplate,
  sanitizeEntry,
  templating
} from '../utils'

export const sections = {}

const SECTION_SELECTOR = '[data-bjs=section]'

const template = `<div class="bjs-article">
  <img src="{{img}}"/>
  <a href="{{url}}">{{title}}</a>
</div>`

const empty = '<p>No se ha encontrado entradas</p>'

const createSection = ($section, dataset, index) => {
  const { homepage, category } = dataset
  const url = homepage

  const callback = dataset.category.replace(/[^A-Z0-9]/ig, '') + index

  sections[callback] = (json) => {
    let html = ''

    if (json.feed.entry) {
      json.feed.entry.forEach((entry) => {
        const data = sanitizeEntry(entry, dataset)
        html += templating(dataset.template, data)
      })
    } else {
      html += dataset.empty
    }

    $section.innerHTML = html
    $section.classList.add('is-loaded')
  }

  createScript(`${url}feeds/posts/default?alt=json-in-script&callback=BloggerJS.sections.${callback}&max-results=${dataset.maxResults}&category=${category}`)
}

const Defaults = {
  observer: true,
  maxResults: 6,
  rootMargin: '200px',
  template,
  empty
}

export function initSection (data = {}) {
  Array.from(document.querySelectorAll(SECTION_SELECTOR))
    .forEach(($section, index) => {
      const config = {
        ...Defaults,
        ...data,
        ...getDataAttributes($section)
      }

      const HTML_TEMPLATE = getHtmlTemplate($section)

      if (HTML_TEMPLATE) {
        config.template = HTML_TEMPLATE
      }

      if (config.observer === true) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              createSection($section, config, index)
              observer.unobserve(entry.target)
            }
          })
        }, { rootMargin: config.rootMargin })

        observer.observe($section)
      } else {
        createSection($section, config, index)
      }
    })
}
