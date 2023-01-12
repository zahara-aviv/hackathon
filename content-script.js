let imageType = 'neither';
// Read it using the storage API
chrome.storage.sync.get(['previousMode'], function(items) {
  // console.log('Settings retrieved', items);
  imageType = items.previousMode;
  modifyImages(null);
});

const cache = {};
const defaultImageLink = {
  cat: 'https://cdn.dribbble.com/users/2479507/screenshots/8678351/media/d336cea07ca3557d6bf17376eb7b68af.gif',
  dog: 'https://static.wixstatic.com/media/72fac8_14ede31619e44b0498c84845f0befbdb~mv2.gif'
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    location.reload();
    if (request.greeting === "hello")
      sendResponse({farewell: "goodbye"});
  }
);


function getImage(elem, bgImage = false) {
  //default to dog
  let fetchURI = 'https://dog.ceo/api/breeds/image/random';
  if (imageType === 'cat') 
    fetchURI = 'https://aws.random.cat/meow';

  // initiate a fetch request 
  // if successful update the elem src
  fetch(fetchURI)
  .then((resp) => {return resp.json()})
  .then((resp) => { 
    let imageLink = resp.message;
    if (imageType === 'cat')
      imageLink = resp.file;
    // console.log(resp);
    // modify the elem by setting attribute src and srcset
    // to resp.file
    if (bgImage) {
      elem.setAttribute('style',`background-image:url(${imageLink})`);
    } else {
      elem.setAttribute('src',imageLink);
      if (elem.getAttribute('srcset') !== null)
        elem.setAttribute('srcset',imageLink);
    }
  })
  .catch((error) => {
    console.log(error);
    const cacheIndex = elem.getAttribute('cache-index');
    delete cache[cacheIndex];
  });
}

document.addEventListener('scroll', modifyImages, false);
window.addEventListener('DOMContentLoaded', modifyImages);

setTimeout(modifyImages,1000);

const isInViewport = function (elem) {
  return true;
  // const bounding = elem.getBoundingClientRect();
  // return (
  //     bounding.top >= 0 &&
  //     bounding.left >= 0 &&
  //     bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
  //     bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
  // );
};

function insertIntoCache(nodeElem, val) {
  const cacheIndex = Math.random() * 9999999;
  nodeElem.setAttribute('cache-index', cacheIndex);
  cache[cacheIndex] = true;
}

function modifyImages(event) {
  if (imageType === 'neither') return;
  const restofNodes = document.querySelectorAll(':not(cache-index)');

  for (let i = 0; i < restofNodes.length; i++) {
    const divStyle = restofNodes[i].getAttribute('style');
    const src = restofNodes[i].getAttribute('src');
    const srcset = restofNodes[i].getAttribute('srcset');

    if(src && !cache[restofNodes[i].getAttribute('cache-index')] && 
        isInViewport(restofNodes[i])) {
      getImage(restofNodes[i]);
      insertIntoCache(restofNodes[i]);
      restofNodes[i].setAttribute('src',defaultImageLink[imageType]);
      if (restofNodes[i].getAttribute('srcset') !== null)
        restofNodes[i].setAttribute('srcset',defaultImageLink[imageType]);
    } else if (divStyle && (divStyle.search('background-image') !== -1) && 
            isInViewport(restofNodes[i])) {
      if(!cache[restofNodes[i].getAttribute('cache-index')]) {
        getImage(restofNodes[i], true);
        insertIntoCache(restofNodes[i]);
        restofNodes[i].setAttribute('src',`background-image:url(${defaultImageLink[imageType]})`);
      }
    } else if (srcset && !cache[restofNodes[i].getAttribute('cache-index')] && 
      isInViewport(restofNodes[i])) {
      getImage(restofNodes[i]);
      insertIntoCache(restofNodes[i]);
      restofNodes[i].setAttribute('srcset',defaultImageLink[imageType]);
    }
  }

}