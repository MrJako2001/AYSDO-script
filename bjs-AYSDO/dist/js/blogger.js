(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.BloggerJS = factory());
})(this, (function () { 'use strict';

  const REG_EXP = /s\d{2}(-w\d{3}-h\d{3})?-c/;
  function getAlternateLink(links) {
    for (const link of links) {
      if (link.rel === 'alternate') {
        return link.href;
      }
    }
  }
  function copyArray(source, array) {
    let index = -1;
    const length = source.length;
    array || (array = new Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }
  function shuffle(array) {
    const length = array == null ? 0 : array.length;
    if (!length) {
      return [];
    }
    let index = -1;
    const lastIndex = length - 1;
    const result = copyArray(array);
    while (++index < length) {
      const rand = index + Math.floor(Math.random() * (lastIndex - index + 1));
      const value = result[rand];
      result[rand] = result[index];
      result[index] = value;
    }
    return result;
  }
  function getFirstImage(code) {
    const temporal = document.createElement('div');
    temporal.innerHTML = code;
    const img = temporal.querySelector('img');
    return img ? img.src : '';
  }
  function formatDate(date, options) {
    const formattedDate = new Date(date);
    const day = formattedDate.getDate();
    const month = formattedDate.getMonth() + 1; // January is 0
    const year = formattedDate.getFullYear();

    // Creamos el formato "7/24/2023"
    const formattedDateString = `${month}/${day}/${year}`;
    return formattedDateString;
  }
  function removeTags(html) {
    return html.replace(/<[^>]*>?/g, '');
  }
  function truncate(str, length) {
    return str.length > length ? `${str.substring(0, length)}...` : str;
  }
  function getHtmlTemplate(container) {
    if (!container) {
      return false;
    }
    const template = container.querySelector('[data-bjs=template]');
    if (!template) {
      return false;
    }
    template.removeAttribute('data-bjs');
    const html = template.outerHTML;
    template.remove();
    return html.replace(/data-src/g, 'src');
  }
  function templating(template, data) {
    return template.replace(/\{\{(.*?)\}\}/g, (_, key) => data[key]);
  }
  function normalizeData(value) {
    if (value === 'true') {
      return true;
    }
    if (value === 'false') {
      return false;
    }
    if (Number(value).toString() === value) {
      return Number(value);
    }
    if (value === 'null' || value === '') {
      return null;
    }
    return value;
  }
  function getDataAttributes({
    dataset = {}
  }) {
    const attributes = {};
    Object.keys(dataset).forEach(key => {
      attributes[key] = normalizeData(dataset[key]);
    });
    return attributes;
  }
  function createScript(src) {
    const $script = document.createElement('script');
    $script.src = src;
    document.body.appendChild($script).parentNode.removeChild($script);
  }
  const IMAGE_SCHEMA = {
    small: 's80-c',
    medium: 's300',
    large: 's500',
    max: 's800'
  };
  const YOUTUBE_SCHEMA = {
    small: 'default',
    medium: 'mqdefault',
    large: 'hqdefault',
    max: 'maxresdefault'
  };
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
  };
  function isYoutubeUrl(url) {
    if (url == null || typeof url !== 'string') return false;
    return url.includes('img.youtube.com');
  }
  function resizeImage(imgUrl, size) {
    if (isYoutubeUrl(imgUrl)) {
      return imgUrl.replace('default', YOUTUBE_SCHEMA[size] || size);
    }
    return imgUrl.replace(REG_EXP, IMAGE_SCHEMA[size] || size);
  }
  function isNumberLike(value) {
    return Number(value).toString() === value;
  }
  function createTagLinks(labels, options) {
    const length = labels == null ? 0 : labels.length;
    if (!length) {
      return [];
    }
    labels = labels?.map(c => `<a class='${options.prefixClass + c.term}' href='${options.origin}search/label/${c.term}'>${options.before + c.term + options.after}</a>`)?.join('');
    return `<div class='${options.containerClass}'>${labels}</div>`;
  }
  function sanitizeEntry(entry, dataset) {
    const [author] = entry.author;
    const content = entry.content ? entry.content.$t : entry.summary.$t;
    const data = {
      ...sanitizeDefaults,
      ...dataset
    };
    const entryId = entry.id.$t.split('.post-');
    const postId = entryId[1];
    const blogId = entryId[0].split(':blog-')[1];
    const image = entry.media$thumbnail ? entry.media$thumbnail.url : getFirstImage(content) || data.image;
    const authorImage = author.gd$image.src.includes('g/blank.gif') || author.gd$image.src.includes('g/b16-rounded.gif') ? data.avatarImage : author.gd$image.src;
    const home = data.homepage;
    const maxLabels = data.labels.length || 10;
    const category = entry.category !== null ? entry.category : false;
    const labels = category?.filter(c => !c.term.includes(data.labels.without || 'undefined_terms'))?.filter(c => !(data.labels.remove || []).includes(c.term)).slice(0, maxLabels);
    const labelsTerm = entry.category?.filter(c => c.term.includes(data.labels.terms || '')).slice(0, maxLabels);
    const labelsFilter = entry.category?.filter(c => (data.labels.filter || []).includes(c.term)).slice(0, maxLabels);
    const labelsOptions = {
      origin: home,
      prefixClass: data.labels.prefixClass || 'label-',
      containerClass: data.labels.containerClass || 'labels',
      before: data.labels.before || '',
      after: data.labels.after || ''
    };
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
      time: formatDate(entry.published.$t),
      snippet: truncate(removeTags(content), data.snippet),
      labels: labels == null ? [] : labels?.map(c => c.term),
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
    };
  }
  function getUrlData() {
    const data = new URLSearchParams(window.location.search);
    let page = data.get('page');
    if (page === null || !isNumberLike(page) || Number(page) < 1) {
      page = '1';
    }
    return {
      page: Number(page),
      results: data.get('max-results'),
      label: data.get('label'),
      view: data.get('view')
    };
  }

  const sections = {};
  const SECTION_SELECTOR = '[data-bjs=section]';
  const template$3 = `<div class="bjs-article">
  <img src="{{img}}"/>
  <a href="{{url}}">{{title}}</a>
</div>`;
  const empty$2 = '<p>No se ha encontrado entradas</p>';
  const createSection = ($section, dataset, index) => {
    const {
      homepage,
      category
    } = dataset;
    const url = homepage;
    const callback = dataset.category.replace(/[^A-Z0-9]/ig, '') + index;
    sections[callback] = json => {
      let html = '';
      if (json.feed.entry) {
        json.feed.entry.forEach(entry => {
          const data = sanitizeEntry(entry, dataset);
          html += templating(dataset.template, data);
        });
      } else {
        html += dataset.empty;
      }
      $section.innerHTML = html;
      $section.classList.add('is-loaded');
    };
    createScript(`${url}feeds/posts/default?alt=json-in-script&callback=BloggerJS.sections.${callback}&max-results=${dataset.maxResults}&category=${category}`);
  };
  const Defaults = {
    observer: true,
    maxResults: 6,
    rootMargin: '200px',
    template: template$3,
    empty: empty$2
  };
  function initSection(data = {}) {
    Array.from(document.querySelectorAll(SECTION_SELECTOR)).forEach(($section, index) => {
      const config = {
        ...Defaults,
        ...data,
        ...getDataAttributes($section)
      };
      const HTML_TEMPLATE = getHtmlTemplate($section);
      if (HTML_TEMPLATE) {
        config.template = HTML_TEMPLATE;
      }
      if (config.observer === true) {
        const observer = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              createSection($section, config, index);
              observer.unobserve(entry.target);
            }
          });
        }, {
          rootMargin: config.rootMargin
        });
        observer.observe($section);
      } else {
        createSection($section, config, index);
      }
    });
  }

  const comments = {};
  const template$2 = `<div class="bjs-comments">
  <img src="{{author_image}}"/>
  <a href="{{url}}">{{author_name}}</a>
  <p>{{snippet}}</p>
</div>`;
  const empty$1 = '<p>Sin comentarios</p>';
  const Default$2 = {
    maxResults: 6,
    template: template$2,
    empty: empty$1
  };
  const CONTAINER_ELEMENT$2 = '[data-bjs=comments]';
  const createComments = ($comment, dataset, index) => {
    const callback = 'comments' + index;
    comments[callback] = json => {
      let html = '';
      if (json.feed.entry) {
        json.feed.entry.forEach(entry => {
          const data = sanitizeEntry(entry, dataset);
          html += templating(dataset.template, data);
        });
      } else {
        html += dataset.empty;
      }
      $comment.innerHTML = html;
    };
    createScript(`${dataset.homepage}feeds/comments/default?alt=json-in-script&callback=BloggerJS.comments.${callback}&max-results=${dataset.maxResults}`);
  };
  function initComments(data = {}) {
    Array.from(document.querySelectorAll(CONTAINER_ELEMENT$2)).forEach(($comment, index) => {
      const config = {
        ...Default$2,
        ...data,
        ...getDataAttributes($comment)
      };
      const HTML_TEMPLATE = getHtmlTemplate($comment);
      if (HTML_TEMPLATE) {
        config.template = HTML_TEMPLATE;
      }
      createComments($comment, config, index);
    });
  }

  const template$1 = `<div class="bjs-article">
  <img src="{{img}}"/>
  <a href="{{url}}">{{title}}</a>
</div>`;
  let Default$1 = {
    id: '',
    length: 7,
    maxResults: 8,
    tags: [],
    random: true,
    template: template$1
  };
  const CONTAINER_ELEMENT$1 = document.querySelector('[data-bjs=related]');
  function initRelated(data = {}) {
    if (!CONTAINER_ELEMENT$1) {
      return;
    }
    Default$1 = {
      ...Default$1,
      ...data,
      ...getDataAttributes(CONTAINER_ELEMENT$1)
    };
    const HTML_TEMPLATE = getHtmlTemplate(CONTAINER_ELEMENT$1);
    if (HTML_TEMPLATE) {
      Default$1.template = HTML_TEMPLATE;
    }
    const labels = typeof Default$1.tags === 'string' ? JSON.parse(Default$1.tags) : Default$1.tags;
    const tags = labels.map(tag => `label:"${tag}"`).join('|');
    createScript(`${Default$1.homepage}feeds/posts/default?alt=json-in-script&callback=BloggerJS.related&max-results=${Default$1.maxResults}&q=${tags}`);
  }
  function getPostId(entry) {
    return entry.id.$t.split('.post-')[1];
  }
  function related(json) {
    if (!json.feed.entry) {
      return;
    }
    let html = '';
    let entry = json.feed.entry.filter(entry => getPostId(entry) !== Default$1.id);
    if (Default$1.random) {
      entry = shuffle(entry);
    }
    const length = entry.length <= Default$1.length ? entry.length : Default$1.length;
    Array.from({
      length: length
    }).forEach((_, index) => {
      html += templating(Default$1.template, sanitizeEntry(entry[index], Default$1));
    });
    CONTAINER_ELEMENT$1.innerHTML = html;
  }

  function createPageUrl({
    number,
    label,
    perPage
  }) {
    let url = `/search?page=${number}`;
    const params = {
      ...getUrlData()
    };
    if (label) {
      url += `&label=${label}`;
    }
    if (params.view) {
      url += `&view=${params.view}`;
    }
    url += `&max-results=${params.results ?? perPage}`;
    return url;
  }
  function generateNumbers(current, length, last) {
    const numbers = [];
    if (current > last) {
      current = last;
    }
    let from = 1;
    let to = last || 1;
    if (last >= length) {
      to = Math.min(Math.max(current + Math.ceil(length / 2) - 1, length), last);
      from = to - length + 1;
    }
    for (let i = from; i <= to; i++) {
      numbers.push(i);
    }
    return numbers;
  }
  function createListItem({
    active,
    url,
    title,
    className = ''
  }) {
    const $li = document.createElement('li');
    const $link = document.createElement('a');
    $link.href = url;
    $link.innerHTML = title;
    $link.className = className;
    if (active) {
      $li.classList.add('is-active');
    }
    $li.appendChild($link);
    return $li;
  }
  function createDotItem({
    className
  }) {
    const $li = document.createElement('li');
    const $span = document.createElement('span');
    $span.textContent = '...';
    $span.className = className;
    $li.appendChild($span);
    return $li;
  }
  function createFirstPageItem({
    homepage,
    firstPage,
    perPage,
    label,
    active,
    className
  }) {
    const url = firstPage ? homepage : createPageUrl({
      number: '1',
      label,
      perPage
    });
    return createListItem({
      url,
      title: '1',
      active,
      className
    });
  }
  function createPagination({
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
    const $fragment = document.createDocumentFragment();
    const totalPages = Math.ceil(total / (results ?? perPage));
    const items = generateNumbers(page, length, totalPages);
    if (page - 1 > 0) {
      const url = firstPage && page - 1 === 1 ? homepage : createPageUrl({
        number: page - 1,
        label,
        perPage
      });
      const $prev = createListItem({
        url,
        title: prevText,
        className: prevPageClass
      });
      $fragment.appendChild($prev);
    }
    if (firstPageVisible && !items.includes(1)) {
      const $first = createFirstPageItem({
        firstPage,
        homepage,
        label,
        className: firstPageClass,
        perPage: perPage
      });
      const $dots = createDotItem({
        className: dotsPageClass
      });
      $fragment.appendChild($first);
      $fragment.appendChild($dots);
    }
    items.forEach(number => {
      let $item = null;
      if (number === 1) {
        $item = createFirstPageItem({
          firstPage,
          homepage,
          label,
          active: number === page,
          className: numberClass,
          perPage: perPage
        });
      } else {
        $item = createListItem({
          url: createPageUrl({
            number,
            label,
            perPage
          }),
          title: number,
          active: number === page,
          className: numberClass
        });
      }
      $fragment.appendChild($item);
    });
    if (lastPageVisible && !items.includes(totalPages)) {
      const $last = createListItem({
        url: createPageUrl({
          number: totalPages,
          label,
          perPage
        }),
        title: lastPageText || totalPages,
        className: lastPageClass
      });
      const $dots = createDotItem({
        className: dotsPageClass
      });
      $fragment.appendChild($dots);
      $fragment.appendChild($last);
    }
    if (page + 1 <= totalPages) {
      const url = createPageUrl({
        number: page + 1,
        label,
        perPage
      });
      const $next = createListItem({
        url,
        title: nextText,
        className: nextPageClass
      });
      $fragment.appendChild($next);
    }
    container.innerHTML = '';
    container.appendChild($fragment);
  }
  function createStandardPagination({
    options,
    data,
    container
  }) {
    let html = '';
    data.feed.entry.forEach(entry => {
      html += templating(options.template, sanitizeEntry(entry, options));
    });
    createPagination({
      ...options,
      total: Number(data.feed.openSearch$totalResults.$t),
      container
    });
    return html;
  }

  function createInfiniteTemplate({
    container,
    pagination,
    withButton = false,
    buttonClass,
    buttonText,
    onClick = () => {},
    onVisible = () => {},
    rootMargin = '100px'
  }) {
    let $button = null;
    if (withButton) {
      $button = document.createElement('button');
      $button.className = buttonClass;
      $button.textContent = buttonText;
      $button.addEventListener('click', () => {
        onClick({
          button: $button,
          container: container
        });
      });
      pagination.innerHTML = '';
      pagination.appendChild($button);
    } else {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            onVisible();
          }
        });
      }, {
        rootMargin
      });
      observer.observe(pagination);
    }
    return {
      container: container,
      button: $button
    };
  }
  function createInfinitePagination({
    data,
    options,
    page,
    container
  }) {
    if (!options.firstPage && page === 1) {
      container.innerHTML = '';
    }
    data.forEach(entry => {
      if (!(options.firstPage && page === 1)) {
        container.innerHTML += templating(options.template, sanitizeEntry(entry, options));
      }
    });
  }

  const template = '<div><img src="{{img}}"/><a href="{{url}}">{{title}}</a></div>';
  const empty = '<p>No se ha encontrado entradas</p>';
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
  };
  function createScriptByPage({
    homepage,
    label,
    perPage,
    page
  }) {
    const url = `${homepage}feeds/posts/default${label ? `/-/${label}` : ''}?alt=json-in-script&callback=BloggerJS.entry&max-results=${perPage}`;
    const startIndex = (page - 1) * perPage + 1;
    createScript(`${url}&start-index=${startIndex}`);
  }
  const CONTAINER_ELEMENT = document.querySelector('[data-bjs=entry]');
  const PAGINATION_ELEMENT = document.querySelector('[data-bjs=pagination]');
  let infiniteTemplate;
  let pageExample = 1;
  let loadingInfinitePagination = false;
  function initEntry(data = {}) {
    Default = {
      ...Default,
      ...getUrlData(),
      ...data,
      ...getDataAttributes(CONTAINER_ELEMENT || false),
      ...getDataAttributes(PAGINATION_ELEMENT || false)
    };
    const HTML_TEMPLATE = getHtmlTemplate(CONTAINER_ELEMENT);
    if (HTML_TEMPLATE) {
      Default.template = HTML_TEMPLATE;
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
    } = Default;
    const perPage = Default.results ?? Default.perPage;
    const url = `${homepage}feeds/posts/default${label ? `/-/${label}` : ''}?alt=json-in-script&callback=BloggerJS.entry&max-results=${perPage}`;
    if (Default.infinite) {
      if (!(CONTAINER_ELEMENT && PAGINATION_ELEMENT)) {
        return;
      }
      const startUrl = !firstPage ? url : url.replace(/max-results=(.[0-9]*)/, 'max-results=1');
      createScript(`${startUrl}&start-index=1`);
      infiniteTemplate = createInfiniteTemplate({
        buttonClass,
        buttonText,
        rootMargin,
        withButton,
        container: CONTAINER_ELEMENT,
        pagination: PAGINATION_ELEMENT,
        onClick({
          button
        }) {
          if (loadingInfinitePagination) return;
          button.textContent = Default.buttonTextLoading;
          loadingInfinitePagination = true;
          pageExample++;
          createScriptByPage({
            label,
            perPage,
            homepage,
            page: pageExample
          });
        },
        onVisible() {
          pageExample++;
          createScriptByPage({
            label,
            perPage,
            homepage,
            page: pageExample
          });
        }
      });
    } else {
      const startIndex = (page - 1) * perPage + 1;
      createScript(`${url}&start-index=${startIndex}`);
    }
  }
  function setContainerContent(content) {
    CONTAINER_ELEMENT.innerHTML += content;
  }
  function entry(json) {
    if (!json.feed.entry) {
      CONTAINER_ELEMENT.innerHTML = '';
      setContainerContent(Default.empty);
      if (Default.infinite) {
        PAGINATION_ELEMENT.remove();
      }
      return;
    }
    if (Default.infinite) {
      const {
        button,
        container
      } = infiniteTemplate;
      loadingInfinitePagination = false;
      createInfinitePagination({
        button,
        container,
        page: pageExample,
        data: json.feed.entry,
        options: Default
      });
      if (Default.withButton) {
        button.textContent = Default.buttonText;
      }
      const total = Number(json.feed.openSearch$totalResults.$t);
      const totalPages = Math.ceil(total / (Default.results ?? Default.perPage));
      if (pageExample >= totalPages) {
        PAGINATION_ELEMENT.remove();
      }
      return;
    }
    const html = createStandardPagination({
      options: Default,
      data: json,
      container: PAGINATION_ELEMENT
    });
    if (CONTAINER_ELEMENT) {
      CONTAINER_ELEMENT.innerHTML = '';
      setContainerContent(html);
    }
  }

  var main = {
    sections,
    comments,
    related,
    entry,
    initComments,
    initRelated,
    initEntry,
    initSection
  };

  return main;

}));
