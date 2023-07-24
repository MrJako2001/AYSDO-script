import {
  createScript,
  getDataAttributes,
  getHtmlTemplate,
  getUrlData
} from '../utils'

import { createStandardPagination } from './pagination'
import { createInfinitePagination, createInfiniteTemplate } from './infinite-pagination'

const template = '<div><img src="{{img}}"/><a href="{{url}}">{{title}}</a></div>'

const empty = '<p>No se ha encontrado entradas</p>'

let Default = {
  firstPage: false,
  perPage: 7,
  length: 5,
  label: null,
  prevText: 'Anterior',
  nextText: 'Siguiente',
  lastPageText: null,
  ytThumbnail: 'mqdefault',
  template,
  empty,

  numberClass: 'bjs-number',
  nextPageClass: 'bjs-next-page',
  prevPageClass: 'bjs-prev-page',
  firstPageClass: 'bjs-first-page',
  lastPageClass: 'bjs-last-page',
  dotsPageClass: 'bjs-dots',

  firstPageVisible: true,
  lastPageVisible: true,

  infinite: false,

  withButton: false,
  buttonClass: 'bjs-button-show-more',
  buttonText: 'Cargar mas',
  buttonTextLoading: 'Cargando',
  rootMargin: '100px'
}

function createScriptByPage ({
  homepage,
  label,
  perPage,
  page
}) {
  const url = `${homepage}feeds/posts/default${label ? `/-/${label}` : ''}?alt=json-in-script&callback=BloggerJS.entry&max-results=${perPage}`
  const startIndex = ((page - 1) * perPage) + 1

  createScript(`${url}&start-index=${startIndex}`)
}

const CONTAINER_ELEMENT = document.querySelector('[data-bjs=entry]')
const PAGINATION_ELEMENT = document.querySelector('[data-bjs=pagination]')

let infiniteTemplate
let pageExample = 1
let loadingInfinitePagination = false

export function initEntry (data = {}) {
  Default = {
    ...Default,
    ...getUrlData(),
    ...data,
    ...getDataAttributes(CONTAINER_ELEMENT || false),
    ...getDataAttributes(PAGINATION_ELEMENT || false)
  }

  const HTML_TEMPLATE = getHtmlTemplate(CONTAINER_ELEMENT)

  if (HTML_TEMPLATE) {
    Default.template = HTML_TEMPLATE
  }

  const {
    firstPage,
    homepage,
    page,
    label,
    withButton,
    buttonClass,
    buttonText,
    rootMargin
  } = Default

  const perPage = Default.results ?? Default.perPage

  const url = `${homepage}feeds/posts/default${label ? `/-/${label}` : ''}?alt=json-in-script&callback=BloggerJS.entry&max-results=${perPage}`

  if (Default.infinite) {
    if (!(CONTAINER_ELEMENT && PAGINATION_ELEMENT)) {
      return
    }

    const startUrl = !firstPage ? url : url.replace(/max-results=(.[0-9]*)/, 'max-results=1')

    createScript(`${startUrl}&start-index=1`)

    infiniteTemplate = createInfiniteTemplate({
      buttonClass,
      buttonText,
      rootMargin,
      withButton,

      container: CONTAINER_ELEMENT,
      pagination: PAGINATION_ELEMENT,

      onClick ({ button }) {
        if (loadingInfinitePagination) return

        button.textContent = Default.buttonTextLoading

        loadingInfinitePagination = true
        pageExample++

        createScriptByPage({
          label,
          perPage,
          homepage,
          page: pageExample
        })
      },
      onVisible () {
        pageExample++

        createScriptByPage({
          label,
          perPage,
          homepage,
          page: pageExample
        })
      }
    })
  } else {
    const startIndex = ((page - 1) * perPage) + 1

    createScript(`${url}&start-index=${startIndex}`)
  }
}

function setContainerContent (content) {
  CONTAINER_ELEMENT.innerHTML += content
}

export function entry (json) {
  if (!json.feed.entry) {
    CONTAINER_ELEMENT.innerHTML = ''
    setContainerContent(Default.empty)

    if (Default.infinite) {
      PAGINATION_ELEMENT.remove()
    }
    return
  }

  if (Default.infinite) {
    const { button, container } = infiniteTemplate

    loadingInfinitePagination = false

    createInfinitePagination({
      button,
      container,
      page: pageExample,
      data: json.feed.entry,
      options: Default
    })

    if (Default.withButton) {
      button.textContent = Default.buttonText
    }

    const total = Number(json.feed.openSearch$totalResults.$t)
    const totalPages = Math.ceil(total / (Default.results ?? Default.perPage))

    if (pageExample >= totalPages) {
      PAGINATION_ELEMENT.remove()
    }

    return
  }

  const html = createStandardPagination({
    options: Default,
    data: json,
    container: PAGINATION_ELEMENT
  })

  if (CONTAINER_ELEMENT) {
    CONTAINER_ELEMENT.innerHTML = ''
    setContainerContent(html)
  }
}
