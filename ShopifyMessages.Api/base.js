
var appen = appen || (function () {

    var init = function () {
        var form = document.getElementsByTagName('form')[0];
        addEvent(form, 'submit', formSubmit);
    };


    /* == Private == */

    function formSubmit(e) {
        e.preventDefault();
        var inputs = e.target;
        
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].getAttribute('type') !== 'submit') {
                // Validera. Kolla data-attribut om det är retuired eller email
                console.log(inputs[i].value);
            }
        }
 

        try {
            document.getElementById('appen-form-fields').style.display = 'none';
            document.getElementById('appen-form-ty').style.display = 'block';

            var request = new XMLHttpRequest();
            request.open('POST', 'http://localhost:1986/api/form', true);
            request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            request.send({'asd':'hej'});

            //submit to api
            //set "seen"-cookie
            // Expire cookies after 30 seconds
            //var expires = new Date();
            //expires.setTime(expires.getTime() + (30 * 1000));
            //document.cookie = "utm_custom_" + values[o].name + "=" + values[o].value + "; expires= + " + expires + ";path=/;";
        } catch (ex) {
            console.log(ex);
        }
    }

    function addEvent(element, event, func) {
        if (element.addEventListener) {
            element.addEventListener(event, function(e){
                func(e);
            });
        } else if (element.attachEvent) {
            element.attachEvent("on" + event,function(e){
                func(e);
            });
        }
    }

    return {
        Init: init
    };
})();




// Initiate the form onload
document.addEventListener('DOMContentLoaded', function () {
    appen.Init();
}, false);

