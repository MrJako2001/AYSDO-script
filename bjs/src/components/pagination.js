import { templating, sanitizeEntry, getUrlData } from '../utils'

export function createPageUrl ({ number, label, perPage }) {
  let url = `/search?page=${number}`
  const params = { ...getUrlData() }

  if (label) {
    url += `&label=${label}`
  }

  if (params.view) {
    url += `&view=${params.view}`
  }

  url += `&max-results=${params.results ?? perPage}`

  return url
}

export function generateNumbers (current, length, last) {
  const numbers = []

  if (current > last) {
    current = last
  }

  let from = 1
  let to = last || 1

  if (last >= length) {
    to = Math.min(Math.max(current + Math.ceil(length / 2) - 1, length), last)

    from = to - length + 1
  }

  for (let i = from; i <= to; i++) {
    numbers.push(i)
  }

  return numbers
}

export function createListItem ({
  active,
  url,
  title,
  className = ''
}) {
  const $li = document.createElement('li')
  const $link = document.createElement('a')

  $link.href = url
  $link.innerHTML = title
  $link.className = className

  if (active) {
    $li.classList.add('is-active')
  }

  $li.appendChild($link)

  return $li
}

function createDotItem ({ className }) {
  const $li = document.createElement('li')
  const $span = document.createElement('span')

  $span.textContent = '...'
  $span.className = className

  $li.appendChild($span)

  return $li
}

function createFirstPageItem ({
  homepage,
  firstPage,
  perPage,
  label,
  active,
  className
}) {
  const url = firstPage ? homepage : createPageUrl({ number: '1', label, perPage })

  return createListItem({
    url,
    title: '1',
    active,
    className
  })
}

export function createPagination ({
  container,
  page,
  results,
  perPage,
  length,
  total,
  label,
  prevText,
  nextText,
  lastPageText,
  firstPage,
  homepage,

  numberClass,
  nextPageClass,
  prevPageClass,
  lastPageClass,
  firstPageClass,
  dotsPageClass,

  firstPageVisible,
  lastPageVisible
}) {
  const $fragment = document.createDocumentFragment()
  const totalPages = Math.ceil(total / (results ?? perPage))

  const items = generateNumbers(page, length, totalPages)

  if (page - 1 > 0) {
    const url = firstPage && page - 1 === 1 ? homepage : createPageUrl({ number: page - 1, label, perPage })

    const $prev = createListItem({
      url,
      title: prevText,
      className: prevPageClass
    })

    $fragment.appendChild($prev)
  }

  if (firstPageVisible && !items.includes(1)) {
    const $first = createFirstPageItem({
      firstPage,
      homepage,
      label,
      className: firstPageClass,
      perPage: perPage
    })

    const $dots = createDotItem({ className: dotsPageClass })

    $fragment.appendChild($first)
    $fragment.appendChild($dots)
  }

  items.forEach((number) => {
    let $item = null

    if (number === 1) {
      $item = createFirstPageItem({
        firstPage,
        homepage,
        label,
        active: number === page,
        className: numberClass,
        perPage: perPage
      })
    } else {
      $item = createListItem({
        url: createPageUrl({ number, label, perPage }),
        title: number,
        active: number === page,
        className: numberClass
      })
    }

    $fragment.appendChild($item)
  })

  if (lastPageVisible && !items.includes(totalPages)) {
    const $last = createListItem({
      url: createPageUrl({ number: totalPages, label, perPage }),
      title: lastPageText || totalPages,
      className: lastPageClass
    })

    const $dots = createDotItem({ className: dotsPageClass })

    $fragment.appendChild($dots)
    $fragment.appendChild($last)
  }

  if (page + 1 <= totalPages) {
    const url = createPageUrl({ number: page + 1, label, perPage })

    const $next = createListItem({
      url,
      title: nextText,
      className: nextPageClass
    })

    $fragment.appendChild($next)
  }
  container.innerHTML = ''
  container.appendChild($fragment)
}

export function createStandardPagination ({
  options,
  data,
  container
}) {
  let html = ''

  data.feed.entry.forEach((entry) => {
    html += templating(options.template, sanitizeEntry(entry, options))
  })

  createPagination({
    ...options,
    total: Number(data.feed.openSearch$totalResults.$t),
    container
  })

  return html
}
