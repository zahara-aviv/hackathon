let imageType = 'dog';
// Read it using the storage API
chrome.storage.sync.get(['previousMode'], function(items) {
  // console.log('Settings retrieved', items);
  imageType = items.previousMode;
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
  if (imageType === 'neither') return;
  // get all images
  const sourceImg = document.querySelectorAll("source");
  const dataDiv = document.querySelectorAll("div");
  const data = document.querySelectorAll("img");
  // console.log(data);

  // // replace pictures
  for (let i = 0; i < data.length; i++){
    // removeChild(data[i]);
    // cache[data[i]] = true;
    getImage(imageType, data[i]);
  }
  for (let i = 0; i < sourceImg.length; i++){
    // removeChild(data[i]);
    // cache[data[i]] = true;
    getImage(imageType, sourceImg[i]);
  }
  for (let i = 0; i < dataDiv.length; i++) {
    const divStyle = dataDiv[i].getAttribute('style');
    // console.log(divStyle);
    if (divStyle && divStyle.search('background-image') !== -1)
      getImage(imageType, dataDiv[i], true);
  }
}


// monitor for any updates on page...
let observer = new MutationObserver(modifyImages);
observer.observe(document, {
    // attributes: true
    childList: true,
    subtree: true
});