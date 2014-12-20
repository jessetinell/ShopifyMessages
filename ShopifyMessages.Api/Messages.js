
var appen = appen || (function () {
    var Message;

    var init = function () {
        console.log(appenMessages);
        for (i = 0; i < appenMessages.length; i++) {

            if (shouldDisplayMessage(appenMessages[i])) {
                Message = appenMessages[i];
                displayMessage(Message);
                break;
            }
        }
    };


    /* == Private == */
    function shouldDisplayMessage(msg) {
        return true;
    }

    function displayMessage(msg) {
        var body = document.getElementsByTagName('body')[0],
            wrapper = document.createElement('div'),
            popupAligner = document.createElement('div');

        // Create the background (if property is set)
        var bg = document.createElement('div');
        bg.id = 'bg';
        bg.setAttribute('style', 'opacity: 0.3; visibility: visible; position: fixed; top: 0px; right: 0px; bottom: 0px; left: 0px; z-index: 100000000; background-color: black;');
        //Append the bg to the body
        body.appendChild(bg);

        // Set wrapper properties
        wrapper.id = 'appen-message-wrapper';
        wrapper.setAttribute('style', 'opacity: 1; visibility: visible; position: fixed; overflow: auto; top: 0px; right: 0px; left: 0px; bottom: 0px; text-align: center; display: block; z-index: 100000001;');
        body.appendChild(wrapper);
        wrapper.addEventListener('click', function () {
            //Dölj allt
        });

        // Set aligner properties
        popupAligner.setAttribute('style', 'display: inline-block; vertical-align: middle; height: 100%;');
        //Append the aligner to the wrapper
        wrapper.appendChild(popupAligner);

        var messageContainer = document.createElement('div');
        messageContainer.id = 'appen-message-container';
        messageContainer.setAttribute('style', 'display: inline-block;vertical-align:middle;');
        wrapper.appendChild(messageContainer);
        messageContainer.insertAdjacentHTML('beforeend', msg.html);

        console.log(msg.html)

        var form = messageContainer.querySelector('form');
        addEvent(form, 'submit', function (e) {
            // Prevent the form from posting
            e.preventDefault ? e.preventDefault() : e.returnValue = false;

            var request = new XMLHttpRequest();
            request.open('POST', 'http://localhost:19005/api/shopify/formpost', true);
            request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            
            request.send(JSON.stringify({ name: 'asd',email:'asdasd@' }));
            console.log("ASD")
        });
        console.log(form)
        //http://localhost/shopifyapi/api/shopify/formpost
        /*var iframe = document.createElement('iframe');
        iframe.src = Message.url;
        iframe.width = Message.width;
        iframe.height = Message.height;
        iframe.frameBorder = 0;
        iframe.scrolling = "no";
        iframe.setAttribute('style', 'display: inline-block;vertical-align:middle;');
        //Append iframe to wrapper
        wrapper.appendChild(iframe);*/
    }


    function addEvent(element, event, func) {
        if (element.addEventListener) {
            element.addEventListener(event, func);
        } else if (element.attachEvent) {
            element.attachEvent("on" + event, func);
        }
    }

    return {
        Init: init
    };
})();


// Initiate the conversion-banner onload
if (window.attachEvent)
    window.attachEvent('onload', function () { appen.Init(); });
else if (window.addEventListener)
    window.addEventListener('load', function () { appen.Init(); }, false);