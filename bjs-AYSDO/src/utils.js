const REG_EXP = /s\d{2}(-w\d{3}-h\d{3})?-c/

export function getAlternateLink (links) {
  for (const link of links) {
    if (link.rel === 'alternate') {
      return link.href
    }
  }
}

export function random (arr) {
  if (!Array.isArray(arr)) {
    throw new Error('expected an array')
  }
  return arr[Math.floor(Math.random() * arr.length)]
}

export function copyArray (source, array) {
  let index = -1
  const length = source.length

  array || (array = new Array(length))
  while (++index < length) {
    array[index] = source[index]
  }
  return array
}

export function shuffle (array) {
  const length = array == null ? 0 : array.length
  if (!length) {
    return []
  }
  let index = -1
  const lastIndex = length - 1
  const result = copyArray(array)
  while (++index < length) {
    const rand = index + Math.floor(Math.random() * (lastIndex - index + 1))
    const value = result[rand]
    result[rand] = result[index]
    result[index] = value
  }
  return result
}

export function getFirstImage (code) {
  const temporal = document.createElement('div')
  temporal.innerHTML = code

  const img = temporal.querySelector('img')
  return img ? img.src : ''
}

export function formatDate (date, options) {
  const formattedDate = new Date(date)

  const day = formattedDate.getDate()
  const month = formattedDate.getMonth() + 1 // January is 0
  const year = formattedDate.getFullYear()

  // Creamos el formato "7/24/2023"
  const formattedDateString = `${month}/${day}/${year}`

  return formattedDateString
}

export function removeTags (html) {
  return html.replace(/<[^>]*>?/g, '')
}

export function truncate (str, length) {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export function getHtmlTemplate (container) {
  if (!container) {
    return false
  }

  const template = container.querySelector('[data-bjs=template]')

  if (!template) {
    return false
  }

  template.removeAttribute('data-bjs')

  const html = template.outerHTML
  template.remove()

  return html.replace(/data-src/g, 'src')
}

export function templating (template, data) {
  return template
    .replace(/\{\{(.*?)\}\}/g, (_, key) => data[key])
}

export function normalizeData (value) {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  if (Number(value).toString() === value) {
    return Number(value)
  }

  if (value === 'null' || value === '') {
    return null
  }

  return value
}

export function getDataAttributes ({ dataset = {} }) {
  const attributes = {}

  Object.keys(dataset).forEach((key) => {
    attributes[key] = normalizeData(dataset[key])
  })

  return attributes
}

export function createScript (src) {
  const $script = document.createElement('script')

  $script.src = src

  document.body.appendChild($script).parentNode.removeChild($script)
}

export const IMAGE_SCHEMA = {
  small: 's80-c',
  medium: 's300',
  large: 's500',
  max: 's800'
}

export const YOUTUBE_SCHEMA = {
  small: 'default',
  medium: 'mqdefault',
  large: 'hqdefault',
  max: 'maxresdefault'
}

const sanitizeDefaults = {
  homepage: window.location.origin + '/',
  category: null,
  locale: 'es-ES',
  snippet: 100,
  format: {
    month: 'numeric',
    day: '2-digit',
    year: 'numeric'
  },
  image: '',
  imageSize: 's300',
  avatarImage: 'https://www.gravatar.com/avatar/?d=mm',
  avatarSize: 's80',
  authorName: 'Unknown',
  authorUrl: '',
  labels: {}
}

export function isYoutubeUrl (url) {
  if (url == null || typeof url !== 'string') return false

  return url.includes('img.youtube.com')
}

export function resizeImage (imgUrl, size) {
  if (isYoutubeUrl(imgUrl)) {
    return imgUrl.replace('default', YOUTUBE_SCHEMA[size] || size)
  }

  return imgUrl.replace(REG_EXP, IMAGE_SCHEMA[size] || size)
}

export function isNumberLike (value) {
  return Number(value).toString() === value
}

export function createTagLinks (labels, options) {
  const length = labels == null ? 0 : labels.length

  if (!length) {
    return []
  }

  labels = labels
    ?.map((c) => `<a class='${options.prefixClass + c.term}' href='${options.origin}search/label/${c.term}'>${options.before + c.term + options.after}</a>`)
    ?.join('')

  return `<div class='${options.containerClass}'>${labels}</div>`
}

export function sanitizeEntry (entry, dataset) {
  const [author] = entry.author
  const content = entry.content ? entry.content.$t : entry.summary.$t

  const data = {
    ...sanitizeDefaults,
    ...dataset
  }

  const entryId = entry.id.$t.split('.post-')
  const postId = entryId[1]
  const blogId = entryId[0].split(':blog-')[1]

  const image = entry.media$thumbnail
    ? entry.media$thumbnail.url
    : getFirstImage(content) || data.image

  const authorImage = author.gd$image.src.includes('g/blank.gif') || author.gd$image.src.includes('g/b16-rounded.gif')
    ? data.avatarImage
    : author.gd$image.src

  const home = data.homepage
  const maxLabels = data.labels.length || 10
  const category = entry.category !== null ? entry.category : false

  const labels = category
    ?.filter((c) => !c.term.includes((data.labels.without || 'undefined_terms')))
    ?.filter((c) => !(data.labels.remove || []).includes(c.term))
    .slice(0, maxLabels)

  const labelsTerm = entry.category
    ?.filter((c) => c.term.includes((data.labels.terms || '')))
    .slice(0, maxLabels)

  const labelsFilter = entry.category
    ?.filter((c) => (data.labels.filter || []).includes(c.term))
    .slice(0, maxLabels)

  const labelsOptions = {
    origin: home,
    prefixClass: data.labels.prefixClass || 'label-',
    containerClass: data.labels.containerClass || 'labels',
    before: data.labels.before || '',
    after: data.labels.after || ''
  }

  return {
    blog_id: blogId,
    post_id: postId,

    author_name: author.name.$t !== 'Unknown' ? author.name.$t : data.authorName,
    author_url: author.uri ? author.uri.$t : data.authorUrl,
    author_image: authorImage.replace(/s\B\d{2,4}/, data.avatarSize),
    author_email: author.email ? author.email.$t : '#noEmail',

    img: resizeImage(image, isYoutubeUrl(image) ? data.ytThumbnail : data.imageSize),
    img_max: resizeImage(image, 'max'),
    img_large: resizeImage(image, 'large'),
    img_medium: resizeImage(image, 'medium'),
    img_small: resizeImage(image, 'small'),

    time: formatDate(entry.published.$t, { locale: data.locale, format: data.format }),
    snippet: truncate(removeTags(content), data.snippet),

    labels: (labels == null) ? [] : labels?.map((c) => c.term),
    labels_links: createTagLinks(labels, labelsOptions),
    labels_filter: createTagLinks(labelsFilter, labelsOptions),
    labels_terms: createTagLinks(labelsTerm, labelsOptions),

    content: removeTags(content),
    url: getAlternateLink(entry.link),

    published: new Date(entry.published.$t).getTime(),
    title: entry.title.$t,
    update: new Date(entry.updated.$t).getTime(),

    category: data.category,

    thr: entry.thr$total ? entry.thr$total.$t : '0'
  }
}

export function getUrlData () {
  const data = new URLSearchParams(window.location.search)
  let page = data.get('page')

  if (page === null || !isNumberLike(page) || Number(page) < 1) {
    page = '1'
  }

  return {
    page: Number(page),
    results: data.get('max-results'),
    label: data.get('label'),
    view: data.get('view')
  }
}
