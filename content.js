/*
Content file to scrap web page to get answers of a question
*/

chrome.extension.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.action == "ocrResult") {
    console.log("yuhoo" + msg.text);
    $("body").append(
      "<div class='modal_content'><div class='modal_header'><div class='modal_title'>Output OCR: </div><div class='close'><span>x</span></div></div><hr><div class='msg_text'>" +
        msg.text +
        "</div>"
    );
    $(".close").click(function () {
      $(".modal_content").remove();
    });
  } else if (msg.action === "ready") {
    let start = {};
    let end = {};
    let isSelecting = false;
    $("body").addClass("closed");
    $("body").append(
      "<div id='successMessage' class='snackbar'>" +
        "Capturing is Active" +
        "</div>"
    );
    $("body").append(
      "<div id='Msk' class='mask'>" + "Capturing is Active" + "</div>"
    );
    $("body").append("<div id='selection'></div>");
    $(window)
      // Listen for selection
      .on("mousedown", function ($event) {
        // Update our state
        isSelecting = true;
        $("#selection").removeClass("complete");
        start.x = $event.pageX;
        start.y = $event.pageY;
        console.log(start.x);
        console.log(start.y);
        // Add selection to screen
        $("#selection").css({
          left: start.x,
          top: start.y,
        });
      })
      // Listen for movement
      .on("mousemove", function ($event) {
        // Ignore if we're not selecing
        if (!isSelecting) {
          return;
        }

        // Update our state
        end.x = $event.pageX;
        end.y = $event.pageY;
        console.log(end.x);
        console.log(end.y);

        // Move & resize selection to reflect mouse position
        $("#selection").css({
          left: start.x < end.x ? start.x : end.x,
          top: start.y < end.y ? start.y : end.y,
          width: Math.abs(start.x - end.x),
          height: Math.abs(start.y - end.y),
        });
      })
      // listen for end
      .on("mouseup", function ($event) {
        // Update our state
        isSelecting = false;
        $("#selection").addClass("complete");
        $("#selection").remove();
        $("#successMessage").remove();
        $("#Msk").remove();
        $("body").removeClass("closed");
        console.log("(" + end.x + "," + end.y + ")");
        let ratio = window.devicePixelRatio;
        console.log(ratio);
        start.x = (start.x - $(window).scrollLeft()) * ratio;
        start.y = (start.y - $(window).scrollTop()) * ratio;
        end.x = (end.x - $(window).scrollLeft()) * ratio;
        end.y = (end.y - $(window).scrollTop()) * ratio;

        $(window).off("mouseup").off("mousedown").off("mousemove");

        sendResponse({
          content: {
            left: start.x < end.x ? start.x : end.x,
            top: start.y < end.y ? start.y : end.y,
            width: Math.abs(start.x - end.x),
            height: Math.abs(start.y - end.y),
          },
          download: "download",
        });
      });
  }

  return true;
});

window.onload = function () {
  console.log("page load!");
};
