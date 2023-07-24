import { sanitizeEntry, templating } from '../utils'

export function createInfiniteTemplate ({
  container,
  pagination,
  withButton = false,

  buttonClass,
  buttonText,

  onClick = () => {},
  onVisible = () => {},

  rootMargin = '100px'
}) {
  let $button = null

  if (withButton) {
    $button = document.createElement('button')

    $button.className = buttonClass
    $button.textContent = buttonText

    $button.addEventListener('click', () => {
      onClick({
        button: $button,
        container: container
      })
    })

    pagination.innerHTML = ''
    pagination.appendChild($button)
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onVisible()
        }
      })
    }, {
      rootMargin
    })

    observer.observe(pagination)
  }

  return {
    container: container,
    button: $button
  }
}

export function createInfinitePagination ({
  data,
  options,
  page,
  container
}) {
  if (!options.firstPage && page === 1) {
    container.innerHTML = ''
  }

  data.forEach((entry) => {
    if (!(options.firstPage && page === 1)) {
      container.innerHTML += templating(options.template, sanitizeEntry(entry, options))
    }
  })
}
