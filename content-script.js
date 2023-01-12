let imageType = 'neither';
const cache = {};

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

// function onMutation(mutations) {
//   for (var i = 0, len = mutations.length; i < len; i++) {
//       var added = mutations[i].addedNodes;
//       for (var j = 0, lenAdded = added.length; j < lenAdded; j++) {
//           var node = added[j];

//           if (!node.parentNode || !node.textContent.match(pattern)) continue;

//           editNode(node);
//       }
//   }
// }

// function editNode(node) {
//   var treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
//   var textNode;

//   while (textNode = treeWalker.nextNode()) {
//       textNode.nodeValue = textNode.nodeValue.replace(pattern, '');
//       mutation.addedNodes.setAttribute('cache-index', undefined);
//   }
// }


function modifyImages(mutations) {
  if (imageType === 'neither') return;
  // for (const mutation of mutations) {
  //   var added = mutations[i].addedNodes;
  //   for (var j = 0, lenAdded = added.length; j < lenAdded; j++) {
  //       var node = added[j];

  //       if (!node.parentNode || !node.textContent.match(pattern)) continue;

  //       editNode(node);
  //   }
  //   editNode(node);
  // }
  // get all images
  const srcImgNodes = document.querySelectorAll("source");
  const divNodes = document.querySelectorAll("div");
  const imgNodes = document.querySelectorAll("img");
  // console.log(data);

  // // replace pictures
  for (let i = 0; i < imgNodes.length; i++){
    if(!cache[imgNodes[i].getAttribute('cache-index')]) {
      getImage(imageType, imgNodes[i]);
      const cacheIndex = Math.random() * 999999;
      imgNodes[i].setAttribute('cache-index', cacheIndex);
      cache[cacheIndex] = true;
    }
  }
  for (let i = 0; i < srcImgNodes.length; i++){
    if(!cache[srcImgNodes[i].getAttribute('cache-index')]) {
      getImage(imageType, srcImgNodes[i]);
      const cacheIndex = Math.random() * 999999;
      srcImgNodes[i].setAttribute('cache-index', cacheIndex);
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
        cache[cacheIndex] = true;
      }
    }
  }
}


// monitor for any updates on page...
let observer = new MutationObserver(modifyImages);
observer.observe(document, {
    // attributes: true
    childList: true,
    subtree: true
});