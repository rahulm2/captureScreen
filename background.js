let captureScreen = {
  content: document.createElement("canvas"),
  data: "",

  init: function () {
    this.initEvents();
  },

  processImage: function (dimensions) {
    let image = new Image();
    image.onload = function () {
      let canvas = captureScreen.content;
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      let context = canvas.getContext("2d");
      context.drawImage(
        image,
        dimensions.left,
        dimensions.top,
        dimensions.width,
        dimensions.height,
        0,
        0,
        dimensions.width,
        dimensions.height
      );

      doOCR(captureScreen.content.toDataURL());
      link.click();
      captureScreen.data = "";
    };
    image.src = captureScreen.data;
  },

  initEvents: function () {
    chrome.commands.onCommand.addListener(function (command) {
      console.log("Command:", command);
      trigger();
    });
    chrome.browserAction.onClicked.addListener(function (tab) {
      trigger();
    });
  },
};

let trigger = () => {
  chrome.tabs.captureVisibleTab(
    null,
    {
      format: "png",
      quality: 100,
    },
    function (data) {
      captureScreen.data = data;

      // send an alert message to webpage
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        function (tabs) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "ready" }, function (
            response
          ) {
            if (response.download === "download") {
              captureScreen.processImage(response.content);
            } else {
              captureScreen.data = "";
            }
          });
        }
      );
    }
  );
};

const doOCR = async (image) => {
  const { createWorker } = Tesseract;
  const worker = createWorker({
    workerPath: chrome.runtime.getURL("js/worker.min.js"),
    langPath: chrome.runtime.getURL("traineddata"),
    corePath: chrome.runtime.getURL("js/tesseract-core.wasm.js"),
  });

  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const {
    data: { text },
  } = await worker.recognize(image);
  console.log(text);
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "ocrResult", text: text },
        function (response) {}
      );
    }
  );

  await worker.terminate();
};

captureScreen.init();
