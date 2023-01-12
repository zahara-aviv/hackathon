let imageType = 'neither';
const cache = {};
const defaultImageLink = {
  cat: 'https://cdn.dribbble.com/users/2479507/screenshots/8678351/media/d336cea07ca3557d6bf17376eb7b68af.gif',
  dog: 'https://static.wixstatic.com/media/72fac8_14ede31619e44b0498c84845f0befbdb~mv2.gif'
}

// Read it using the storage API
chrome.storage.sync.get(['previousMode'], function(items) {
  // console.log('Settings retrieved', items);
  imageType = items.previousMode;
  modifyImages();
});

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


function getImage(imageType, elem, bgImage = false) {
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
      elem.setAttribute('srcset',imageLink);
    }
  })
  .catch((error) => console.log(error));
}

function modifyImages(mutations) {
  // console.log(mutations);
  if (imageType === 'neither') return;

  // get all images
  const srcImgNodes = document.querySelectorAll("source");
  const divNodes = document.querySelectorAll("div");
  const imgNodes = document.querySelectorAll("img");
  const vidNodes = document.querySelectorAll("video");
  // console.log(data);

  // // replace pictures
  for (let i = 0; i < imgNodes.length; i++){
    if(!cache[imgNodes[i].getAttribute('cache-index')]) {
      getImage(imageType, imgNodes[i]);
      const cacheIndex = Math.random() * 999999;
      imgNodes[i].setAttribute('cache-index', cacheIndex);
      imgNodes[i].setAttribute('src',defaultImageLink[imageType]);
      imgNodes[i].setAttribute('srcset',defaultImageLink[imageType]);
      cache[cacheIndex] = true;
    }
  }
  for (let i = 0; i < srcImgNodes.length; i++){
    if(!cache[srcImgNodes[i].getAttribute('cache-index')]) {
      getImage(imageType, srcImgNodes[i]);
      const cacheIndex = Math.random() * 999999;
      srcImgNodes[i].setAttribute('cache-index', cacheIndex);
      srcImgNodes[i].setAttribute('src',defaultImageLink[imageType]);
      srcImgNodes[i].setAttribute('srcset',defaultImageLink[imageType]);
      cache[cacheIndex] = true;
    }
  }
  for (let i = 0; i < vidNodes.length; i++){
    if(!cache[vidNodes[i].getAttribute('cache-index')]) {
      getImage(imageType, vidNodes[i]);
      const cacheIndex = Math.random() * 999999;
      vidNodes[i].setAttribute('cache-index', cacheIndex);
      vidNodes[i].setAttribute('src',defaultImageLink[imageType]);
      vidNodes[i].setAttribute('srcset',defaultImageLink[imageType]);
      cache[cacheIndex] = true;
    }
  }
  for (let i = 0; i < divNodes.length; i++) {
    const divStyle = divNodes[i].getAttribute('style');
    if (divStyle && divStyle.search('background-image') !== -1) {
      if(!cache[divNodes[i].getAttribute('cache-index')]) {
        getImage(imageType, divNodes[i], true);
        const cacheIndex = Math.random() * 999999;
        divNodes[i].setAttribute('cache-index', cacheIndex);
        imgNodes[i].setAttribute('src',`background-image:url(${defaultImageLink[imageType]})`);
        cache[cacheIndex] = true;
      }
    }
  }
}

// monitor for any updates on page...
let observer = new MutationObserver(modifyImages);
observer.observe(document.body, {
    attributes: true,
    childList: true,
    characterDataOldValue: true,
    characterData: true,
    attributeFilter: ['src', 'srcset', 'style'],
    // subtree: true
});