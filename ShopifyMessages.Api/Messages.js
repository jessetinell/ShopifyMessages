var appen = appen || (function () {
    var Message,
        MessageIsDisplaying = false,
        ForceOpen = false;

    var init = function () {
        console.log(appenMessages);
        if (cookiesAreEnabled()) {
            for (i = 0; i < appenMessages.length; i++) {
                if (shouldDisplayMessage(appenMessages[i])) {
                    Message = appenMessages[i];
                    if (ForceOpen)
                        displayMessage();
                    else {
                        if (Message.displayRules.scrollPosition > 0 || Message.displayRules.seconds > 0) {
                            if (Message.displayRules.scrollPosition > 0)
                                activateOnScroll();
                            else
                                activateInTime();
                        } else {
                            if (Message.displayRules.clicks === 0)
                                displayMessage();
                            else
                                activateClickCount();
                        }
                    }
                    break;
                }
            }
        }
    };


    /* == Private == */
    function shouldDisplayMessage(message) {
        if (ForceOpen)
            return true;

        //VID NAMNBYTE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Byt ut siffrorna 6 + 7. De matchar längden på namnet
        // Check if banner should open with the values of the hash (force open)
        var hash = window.location.hash;
        if (hash.length > 0 && hash.substr(1, 6) == "appen-") {
            var hash_message_id = hash.substr(7);
            if (hash_message_id == message.id) {
                ForceOpen = true;
                return true;
            }
        }

        // If this message-id is not in a cookie
        if (!getCookie(message.id))
            return true;
        return false;
    }

    function displayMessage() {
        if (MessageIsDisplaying)
            return;
        else {
            MessageIsDisplaying = true;
            //setCookie(Message.id, true);

        }

        var body = document.getElementsByTagName('body')[0],
            wrapper = document.createElement('div'),
            popupAligner = document.createElement('div');

        if (Message.useModalBackground) {
            // Create the background (if property is set)
            var bg = document.createElement('div');
            bg.id = 'bg';
            bg.setAttribute('style', 'opacity: 0.3; visibility: visible; position: fixed; top: 0px; right: 0px; bottom: 0px; left: 0px; z-index: 100000000; background-color: black;');
            //Append the bg to the body
            body.appendChild(bg);
        }

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
        positionMessage(messageContainer, Message);
        messageContainer.style.maxWidth = Message.maxWidth + "px";
        messageContainer.style.minHeight = Message.minHeight + "px";
        wrapper.appendChild(messageContainer);
        messageContainer.insertAdjacentHTML('beforeend', Message.html);


        var form = messageContainer.querySelector('form');
        //IF FORM EXISTS
        addEvent(form, 'submit', formSubmit);
        if (document.createElement("input").placeholder == undefined) {
            // Placeholder is not supported. Add label?
        }
    }


    function positionMessage(messageContainer, message) {
        var position = message.position;
        if (position.horizontalAlign === 'center' || position.verticalAlign === 'center')
            messageContainer.setAttribute('style', 'display: inline-block;vertical-align:middle;');
        else {
            messageContainer.style.position = 'absolute';
            messageContainer.style[position.horizontalAlign] = 0;
            messageContainer.style[position.verticalAlign] = 0;
        }
    }

    function formSubmit(e) {
        // Prevent the form from posting
        e.preventDefault ? e.preventDefault() : e.returnValue = false
        var inputs = e.target;

        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].getAttribute('type') !== 'submit') {
                // Validera. Kolla data-attribut om det är required eller email
                console.log(inputs[i].value);
            }
        }

        document.getElementById('appen-form-fields').style.display = 'none';
        document.getElementById('appen-form-submitted').style.display = 'block';

        var request = new XMLHttpRequest();
        request.open('POST', 'http://localhost:19005/api/shopify/formpost', true);
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

        request.send(JSON.stringify({ name: 'asd', email: 'asdasd@' }));
    }

    function activateOnScroll() {
        var scrollTo = Math.floor((document.body.clientHeight - window.innerHeight) * (Message.displayRules.scrollPosition / 100));
        addEvent(document, 'scroll', function () {
            var scrollPosition = typeof window.scrollY == 'undefined' ? document.documentElement.scrollTop : window.scrollY;
            if (scrollPosition > scrollTo && !MessageIsDisplaying) {
                displayMessage();
            }
        });
    }

    function activateInTime() {
        setTimeout(function () {
            displayMessage();
        }, (Message.displayRules.seconds * 1000));
    }

    function activateClickCount() {
        var clicks = getCookie('clicks') || 0;
        if (clicks == Message.displayRules.clicks)
            displayMessage();
        setCookie('clicks', ++clicks,0);
    }

    function getCookie(n) {
        var name = "appen_" + n;
        var ca = document.cookie.split(';');
        for (var i = 0, l = ca.length; i < l; i++) {
            if (ca[i].match(new RegExp("\\b" + name + "="))) {
                return decodeURIComponent(ca[i].split(name + '=')[1]);
            }
        }
        return '';
    }

    function setCookie(n, value, days) {
        var name = "appen_" + n;
        var date = new Date();
        date.setTime(date.getTime() + (days || 30) * 24 * 60 * 60 * 1000);
        document.cookie = name + "=" + value + ";"+ (days > 0 ? "expires=" + date.toGMTString() : "") + ";path=/;";
    }

    function cookiesAreEnabled() {
        var cookieEnabled = (navigator.cookieEnabled) ? true : false;
        if (typeof navigator.cookieEnabled === "undefined" && !cookieEnabled) {
            document.cookie = "testcookie";
            cookieEnabled = (document.cookie.indexOf("testcookie") !== -1) ? true : false;
        }
        return (cookieEnabled);
    }


    function addEvent(el, event, func) {
        if (el.addEventListener) {
            el.addEventListener(event, func);
        } else if (el.attachEvent) {
            el.attachEvent("on" + event, func);
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